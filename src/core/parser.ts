import SwaggerParser from '@apidevtools/swagger-parser';

/**
 * Parses and validates an OpenAPI spec from a URL, inline content, or object.
 * Supports OpenAPI 3.0 and 3.1.
 * Dereferences all $ref pointers so the returned doc is fully resolved.
 *
 * @param specUrlOrContent - URL to a JSON/YAML spec, inline JSON/YAML string, or parsed object
 * @returns Fully dereferenced OpenAPI document
 */
export async function parseSpec(
  specUrlOrContent: string | Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    let input: string | Record<string, unknown>;

    if (typeof specUrlOrContent === 'object') {
      // Already-parsed object — skip string parsing (avoids JSON round-trip)
      input = specUrlOrContent;
    } else if (
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

    // Dereference the spec (resolve all $ref pointers).
    // Uses dereference() instead of validate() because validate() relies on
    // ajv which compiles schemas via new Function() — blocked by strict CSP.
    const api = await SwaggerParser.dereference(input as string);
    const doc = api as unknown as Record<string, unknown>;

    // Reject Swagger 2.0 specs — parameter types and request bodies
    // are structured differently and not supported by the normalizer.
    if (doc.swagger && !doc.openapi) {
      throw new Error(
        'This spec uses Swagger 2.0 format. RunDocs currently supports OpenAPI 3.0 and 3.1 only. ' +
          'Convert your spec to OpenAPI 3.x using https://converter.swagger.io',
      );
    }

    return doc;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse OpenAPI spec: ${message}`);
  }
}
