/**
 * RunDocs core type definitions.
 * These interfaces represent the internal data model that all components consume.
 */

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/** The normalized spec model consumed by all components */
export interface RunDocsSpec {
  info: ApiInfo;
  servers: ServerInfo[];
  tags: TagGroup[];
  endpoints: Endpoint[];
  securitySchemes: Record<string, SecurityScheme>;
  schemas: Record<string, ResolvedSchema>;
}

export interface ApiInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface ServerInfo {
  url: string;
  description?: string;
}

export interface TagGroup {
  name: string;
  description?: string;
  endpoints: Endpoint[];
}

export interface Endpoint {
  /** Unique identifier: "GET:/pets/{petId}" */
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  deprecated: boolean;
  parameters: Parameter[];
  requestBody?: RequestBodyDef;
  responses: Record<string, ResponseDef>;
  security: SecurityRequirement[];
  operationId?: string;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  schema: ResolvedSchema;
  description?: string;
  example?: unknown;
}

export interface RequestBodyDef {
  description?: string;
  required: boolean;
  content: Record<string, MediaTypeDef>;
}

export interface MediaTypeDef {
  schema: ResolvedSchema;
  example?: unknown;
  examples?: Record<string, ExampleDef>;
}

export interface ExampleDef {
  summary?: string;
  description?: string;
  value: unknown;
}

export interface ResponseDef {
  description: string;
  headers?: Record<string, Parameter>;
  content?: Record<string, MediaTypeDef>;
}

export interface ResolvedSchema {
  type?: string;
  format?: string;
  properties?: Record<string, ResolvedSchema>;
  items?: ResolvedSchema;
  enum?: unknown[];
  required?: string[];
  description?: string;
  example?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  oneOf?: ResolvedSchema[];
  anyOf?: ResolvedSchema[];
  allOf?: ResolvedSchema[];
  title?: string;
  additionalProperties?: boolean | ResolvedSchema;
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  name?: string;
  in?: 'header' | 'query' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlows;
  openIdConnectUrl?: string;
  description?: string;
}

export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export type SecurityRequirement = Record<string, string[]>;

/** State for a single request being built */
export interface RequestState {
  method: HttpMethod;
  url: string;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  auth: AuthConfig;
  response: ResponseState | null;
  loading: boolean;
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'apiKey' | 'oauth2';
  token?: string;
  username?: string;
  password?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: 'header' | 'query';
}

export interface ResponseState {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  time: number;
  size: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  endpointId: string;
  method: HttpMethod;
  url: string;
  request: {
    headers: Record<string, string>;
    body: string;
    auth?: AuthConfig;
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string>;
  };
  response: ResponseState;
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  activeSidebarPanel: 'endpoints' | 'history';
  selectedEndpointId: string | null;
  selectedHistoryId: string | null;
  splitRatio: number;
}
