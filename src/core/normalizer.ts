import type {
  RunDocsSpec,
  ApiInfo,
  ServerInfo,
  ServerVariable,
  TagGroup,
  Endpoint,
  Parameter,
  RequestBodyDef,
  ResponseDef,
  ResolvedSchema,
  SecurityScheme,
  HttpMethod,
} from './types.js';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/**
 * Transforms a raw OpenAPI document into the RunDocs internal model.
 * Groups endpoints by tags, extracts server URLs, and builds the
 * data structure consumed by all UI components.
 */
export function normalize(doc: Record<string, unknown>): RunDocsSpec {
  const openapi3 = doc as Record<string, unknown>;

  const info = extractInfo(openapi3);
  const servers = extractServers(openapi3);
  const securitySchemes = extractSecuritySchemes(openapi3);
  const endpoints = extractEndpoints(openapi3);
  const tags = groupByTags(endpoints, openapi3);
  const schemas = extractSchemas(openapi3);

  return {
    info,
    servers,
    tags,
    endpoints,
    securitySchemes,
    schemas,
  };
}

function extractInfo(doc: Record<string, unknown>): ApiInfo {
  const info = (doc.info || {}) as Record<string, unknown>;
  return {
    title: (info.title as string) || 'Untitled API',
    version: (info.version as string) || '0.0.0',
    description: info.description as string | undefined,
    termsOfService: info.termsOfService as string | undefined,
    contact: info.contact as ApiInfo['contact'],
    license: info.license as ApiInfo['license'],
  };
}

function extractServers(doc: Record<string, unknown>): ServerInfo[] {
  const servers = doc.servers as Array<Record<string, unknown>> | undefined;
  if (!servers || !Array.isArray(servers)) {
    // Swagger 2.0 fallback
    const host = doc.host as string | undefined;
    const basePath = doc.basePath as string | undefined;
    const schemes = doc.schemes as string[] | undefined;
    if (host) {
      const scheme = schemes?.[0] || 'https';
      return [{ url: `${scheme}://${host}${basePath || ''}` }];
    }
    return [{ url: '/' }];
  }
  return servers.map((s) => {
    const rawVars = s.variables as Record<string, Record<string, unknown>> | undefined;
    let url = s.url as string;
    let variables: Record<string, ServerVariable> | undefined;

    if (rawVars) {
      variables = {};
      for (const [name, v] of Object.entries(rawVars)) {
        variables[name] = {
          default: (v.default as string) || '',
          enum: v.enum as string[] | undefined,
          description: v.description as string | undefined,
        };
        // Substitute variable default into URL
        url = url.replaceAll(`{${name}}`, (v.default as string) || '');
      }
    }

    return {
      url,
      description: s.description as string | undefined,
      ...(variables ? { variables } : {}),
    };
  });
}

function extractSecuritySchemes(doc: Record<string, unknown>): Record<string, SecurityScheme> {
  const components = doc.components as Record<string, unknown> | undefined;
  const schemes =
    (components?.securitySchemes as Record<string, unknown>) ||
    // Swagger 2.0 fallback
    (doc.securityDefinitions as Record<string, unknown>) ||
    {};

  const result: Record<string, SecurityScheme> = {};
  for (const [name, scheme] of Object.entries(schemes)) {
    result[name] = scheme as SecurityScheme;
  }
  return result;
}

function extractEndpoints(doc: Record<string, unknown>): Endpoint[] {
  const paths = (doc.paths || {}) as Record<string, Record<string, unknown>>;
  const globalSecurity = (doc.security || []) as Endpoint['security'];
  const endpoints: Endpoint[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    // Extract path-level parameters
    const pathParams = (pathItem.parameters || []) as Parameter[];

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as Record<string, unknown> | undefined;
      if (!operation) continue;

      const operationParams = (operation.parameters || []) as unknown[];
      const allParams = deduplicateParams(
        [...pathParams, ...operationParams].map(normalizeParameter),
      );

      const endpoint: Endpoint = {
        id: `${method.toUpperCase()}:${path}`,
        method,
        path,
        summary: (operation.summary as string) || '',
        description: (operation.description as string) || '',
        tags: (operation.tags as string[]) || ['default'],
        deprecated: (operation.deprecated as boolean) || false,
        parameters: allParams,
        requestBody: normalizeRequestBody(operation.requestBody as Record<string, unknown>),
        responses: normalizeResponses(
          (operation.responses || {}) as Record<string, Record<string, unknown>>,
        ),
        security:
          operation.security !== undefined
            ? (operation.security as Endpoint['security'])
            : globalSecurity,
        operationId: operation.operationId as string | undefined,
      };

      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function normalizeParameter(raw: unknown): Parameter {
  const param = raw as Record<string, unknown>;
  return {
    name: (param.name as string) || '',
    in: (param.in as Parameter['in']) || 'query',
    required: (param.required as boolean) || false,
    schema: (param.schema || { type: 'string' }) as ResolvedSchema,
    description: param.description as string | undefined,
    example: param.example,
  };
}

/** Deduplicate parameters by name+in, keeping the last occurrence (operation-level wins). */
function deduplicateParams(params: Parameter[]): Parameter[] {
  const seen = new Map<string, Parameter>();
  for (const param of params) {
    seen.set(`${param.in}:${param.name}`, param);
  }
  return Array.from(seen.values());
}

function normalizeRequestBody(
  raw: Record<string, unknown> | undefined,
): RequestBodyDef | undefined {
  if (!raw) return undefined;
  return {
    description: raw.description as string | undefined,
    required: (raw.required as boolean) || false,
    content: (raw.content || {}) as RequestBodyDef['content'],
  };
}

function normalizeResponses(
  raw: Record<string, Record<string, unknown>>,
): Record<string, ResponseDef> {
  const result: Record<string, ResponseDef> = {};
  for (const [status, response] of Object.entries(raw)) {
    result[status] = {
      description: (response.description as string) || '',
      headers: response.headers as Record<string, Parameter> | undefined,
      content: response.content as Record<string, ResponseDef['content']> | undefined,
    } as ResponseDef;
  }
  return result;
}

function groupByTags(endpoints: Endpoint[], doc: Record<string, unknown>): TagGroup[] {
  const docTags = (doc.tags || []) as Array<Record<string, string>>;
  const tagDescriptions = new Map<string, string>();
  const tagOrder = new Map<string, number>();
  for (let i = 0; i < docTags.length; i++) {
    tagDescriptions.set(docTags[i].name, docTags[i].description || '');
    tagOrder.set(docTags[i].name, i);
  }

  const tagMap = new Map<string, Endpoint[]>();
  for (const endpoint of endpoints) {
    for (const tag of endpoint.tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag)!.push(endpoint);
    }
  }

  const result: TagGroup[] = [];
  for (const [name, tagEndpoints] of tagMap) {
    result.push({
      name,
      description: tagDescriptions.get(name),
      endpoints: tagEndpoints,
    });
  }

  // Sort by doc.tags order; tags not in doc.tags go at the end
  result.sort((a, b) => {
    const orderA = tagOrder.get(a.name) ?? Infinity;
    const orderB = tagOrder.get(b.name) ?? Infinity;
    return orderA - orderB;
  });

  return result;
}

function extractSchemas(doc: Record<string, unknown>): Record<string, ResolvedSchema> {
  const components = doc.components as Record<string, unknown> | undefined;
  const schemas =
    (components?.schemas as Record<string, unknown>) ||
    // Swagger 2.0 fallback
    (doc.definitions as Record<string, unknown>) ||
    {};

  const result: Record<string, ResolvedSchema> = {};
  for (const [name, schema] of Object.entries(schemas)) {
    result[name] = schema as ResolvedSchema;
  }
  return result;
}
