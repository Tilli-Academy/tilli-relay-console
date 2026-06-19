/**
 * Replaces {{variable}} placeholders with values from the variables map.
 * Unmatched placeholders are left as-is.
 *
 * @example
 *   interpolate('https://{{host}}/api', { host: 'api.example.com' })
 *   // => 'https://api.example.com/api'
 */
export function interpolate(
  template: string,
  variables: Record<string, string>,
): string {
  if (!template) return template;
  return template.replace(/\{\{([\w.-]+)\}\}/g, (match, key: string) => {
    return key in variables ? variables[key] : match;
  });
}
