import SwaggerParser from '@apidevtools/swagger-parser';

/**
 * Parses and validates an OpenAPI spec from a URL or inline content.
 * Supports OpenAPI 2.0 (Swagger), 3.0, and 3.1.
 * Dereferences all $ref pointers so the returned doc is fully resolved.
 *
 * @param specUrlOrContent - URL to a JSON/YAML spec, or inline JSON string
 * @returns Fully dereferenced OpenAPI document
 */
export async function parseSpec(specUrlOrContent: string): Promise<Record<string, unknown>> {
  try {
    let input: string | Record<string, unknown>;

    if (
      specUrlOrContent.startsWith('{') ||
      specUrlOrContent.startsWith('openapi') ||
      specUrlOrContent.startsWith('swagger')
    ) {
      // Inline content — parse as JSON first, fall back to YAML
      try {
        input = JSON.parse(specUrlOrContent) as Record<string, unknown>;
      } catch {
        const { default: jsYaml } = await import('js-yaml');
        input = jsYaml.load(specUrlOrContent) as Record<string, unknown>;
      }
    } else {
      // URL — swagger-parser will fetch and parse it
      input = specUrlOrContent;
    }

    // Validate and dereference the spec
    const api = await SwaggerParser.validate(input as string);
    return api as unknown as Record<string, unknown>;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse OpenAPI spec: ${message}`);
  }
}
