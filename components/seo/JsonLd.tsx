type JsonLdProps = {
  data: object;
};

/**
 * Renders JSON-LD for search engines (safe: JSON.stringify of structured data only).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
