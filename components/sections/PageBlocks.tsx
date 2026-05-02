import { ContentBlock } from "@/lib/content";

type PageBlocksProps = {
  blocks: ContentBlock[];
  withSectionWrappers?: boolean;
};

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*([,.!?;:])/g, "$1")
    .replace(/([a-zăâîșț])([A-ZĂÂÎȘȚ])/g, "$1 $2")
    .trim();
}

type BlockGroup = {
  heading?: string;
  blocks: ContentBlock[];
};

function normalizeBlock(block: ContentBlock): ContentBlock {
  if (block.type === "ul") {
    return {
      ...block,
      items: (block.items ?? []).map((item) => normalizeText(item))
    };
  }

  if (!block.text) {
    return block;
  }

  return {
    ...block,
    text: normalizeText(block.text)
  };
}

function renderBlock(block: ContentBlock, key: string) {
  if (block.type === "ul") {
    const items = block.items ?? [];
    if (items.length === 0) return null;
    return (
      <ul key={key}>
        {items.map((item, itemIndex) => (
          <li key={`${key}-${itemIndex}`}>{item}</li>
        ))}
      </ul>
    );
  }

  const text = block.text ?? "";
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
}

function groupByH2(blocks: ContentBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  let current: BlockGroup = { blocks: [] };
  groups.push(current);

  for (const block of blocks) {
    if (block.type === "h2" && block.text?.trim()) {
      current = { heading: normalizeText(block.text), blocks: [] };
      groups.push(current);
      continue;
    }

    current.blocks.push(block);
  }

  return groups;
}

export function PageBlocks({ blocks, withSectionWrappers = true }: PageBlocksProps) {
  const normalizedBlocks = blocks.map(normalizeBlock);

  if (!withSectionWrappers) {
    return (
      <div className="legacy-blocks">
        {normalizedBlocks.map((block, index) => renderBlock(block, `${block.type}-${index}`))}
      </div>
    );
  }

  const groups = groupByH2(normalizedBlocks);

  return (
    <div className="legacy-blocks">
      {groups.map((group, groupIndex) => (
        <section key={`group-${groupIndex}`} className="legacy-section">
          {group.heading ? <h2>{group.heading}</h2> : null}
          {group.blocks.map((block, index) => renderBlock(block, `group-${groupIndex}-${block.type}-${index}`))}
        </section>
      ))}
    </div>
  );
}
