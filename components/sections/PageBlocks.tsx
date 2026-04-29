import { ContentBlock } from "@/lib/content";

type PageBlocksProps = {
  blocks: ContentBlock[];
};

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*([,.!?;:])/g, "$1")
    .replace(/([a-zăâîșț])([A-ZĂÂÎȘȚ])/g, "$1 $2")
    .trim();
}

export function PageBlocks({ blocks }: PageBlocksProps) {
  return (
    <div className="legacy-blocks">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "ul") {
          const items = block.items ?? [];
          if (items.length === 0) return null;
          return (
            <ul key={key}>
              {items.map((item) => (
                <li key={`${key}-${item}`}>{normalizeText(item)}</li>
              ))}
            </ul>
          );
        }

        const text = block.text ? normalizeText(block.text) : "";
        if (!text) return null;

        switch (block.type) {
          case "h1":
            return <h1 key={key}>{text}</h1>;
          case "h2":
            return <h2 key={key}>{text}</h2>;
          case "h3":
            return <h3 key={key}>{text}</h3>;
          case "h4":
            return <h4 key={key}>{text}</h4>;
          case "h5":
            return <h5 key={key}>{text}</h5>;
          case "h6":
            return <h6 key={key}>{text}</h6>;
          default:
            return <p key={key}>{text}</p>;
        }
      })}
    </div>
  );
}
