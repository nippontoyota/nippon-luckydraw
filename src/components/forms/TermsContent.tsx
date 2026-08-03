import type { ReactNode } from "react";

type Block =
  | { type: "h1" | "h2"; text: string }
  | { type: "hr" }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; rows: string[][] };

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line === "---") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.replace(/^#\s+/, "") });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().replace(/^-\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const tableLine = lines[i].trim();
        if (!/^\|[\s:-]+\|/.test(tableLine)) {
          rows.push(
            tableLine
              .slice(1, -1)
              .split("|")
              .map((cell) => cell.trim())
          );
        }
        i += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        current === "---" ||
        current.startsWith("# ") ||
        current.startsWith("## ") ||
        current.startsWith("- ") ||
        current.startsWith("|")
      ) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-[#0E3A36]">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "h1":
      return (
        <h2 key={index} className="text-[20px] font-black leading-tight text-[#0E3A36]">
          {block.text}
        </h2>
      );
    case "h2":
      return (
        <div key={index} className="mt-6 flex items-center gap-2 border-b border-[#FFD400] pb-2 first:mt-0">
          <div className="h-7 w-1 rounded-full bg-[#F47C00]" />
          <h3 className="text-[14px] font-extrabold leading-snug text-[#0E3A36]">
            {block.text}
          </h3>
        </div>
      );
    case "hr":
      return <div key={index} className="h-px bg-[#FFD400]/80" />;
    case "ul":
      return (
        <ul key={index} className="space-y-2 pl-1">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2 text-[12px] font-medium leading-relaxed text-[#0E3A36]">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#F47C00]" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "table": {
      const [head, ...body] = block.rows;
      return (
        <div key={index} className="overflow-x-auto rounded-2xl border border-[#FFD400]">
          <table className="w-full min-w-[520px] border-collapse bg-white text-left text-[11px]">
            <thead className="bg-[#0E3A36] text-white">
              <tr>
                {head.map((cell) => (
                  <th key={cell} className="px-3 py-2.5 font-extrabold">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={row.join("-")} className={rowIndex % 2 ? "bg-[#FFF9E6]" : "bg-white"}>
                  {row.map((cell) => (
                    <td key={cell} className="border-t border-[#FFD400]/70 px-3 py-2.5 font-medium leading-relaxed text-[#0E3A36]">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "paragraph":
      return (
        <p key={index} className="text-[12px] font-medium leading-relaxed text-[#0E3A36]">
          {renderInline(block.text)}
        </p>
      );
  }
}

export function TermsContent({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown).filter((block, index) => {
    if (index === 0 && block.type === "h1") return false;
    if (index === 1 && block.type === "h2") return false;
    return true;
  });

  return <div className="space-y-4">{blocks.map(renderBlock)}</div>;
}
