<script>
  /**
   * A licence (or any plain text file) in a window of its own. The words are exactly the
   * file's; only its hard line breaks are dropped, so paragraphs wrap to the window
   * instead of leaving ragged half-lines on a phone. Rules of dashes become dividers and
   * all-caps lines headings.
   * @typedef {Object} Props
   * @property {string} title
   * @property {string} text
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { title, text } = $props();

  const isRule = (line) => /^-{4,}$/.test(line);
  const isHeading = (line) =>
    line.length <= 40 &&
    /[A-Z]{3}/.test(line) &&
    /^[A-Z0-9][A-Z0-9 &,.'’-]*$/.test(line);

  /** @returns {{ kind: "p" | "heading" | "rule", text?: string }[]} */
  function parse(source) {
    const blocks = [];
    let lines = [];
    const flush = () => {
      if (lines.length) blocks.push({ kind: "p", text: lines.join(" ") });
      lines = [];
    };
    for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
      const line = raw.trim();
      if (!line) flush();
      else if (isRule(line)) {
        flush();
        blocks.push({ kind: "rule" });
      } else if (isHeading(line)) {
        flush();
        blocks.push({ kind: "heading", text: line });
      } else lines.push(line);
    }
    flush();
    // A line between two rules is a title, too
    return blocks.map((block, i) =>
      block.kind === "p" &&
      blocks[i - 1]?.kind === "rule" &&
      blocks[i + 1]?.kind === "rule"
        ? { kind: "heading", text: block.text }
        : block,
    );
  }

  const blocks = $derived(parse(text));
</script>

<article class="license">
  <h2 class="title">{title}</h2>
  {#each blocks as block}
    {#if block.kind === "rule"}
      <hr />
    {:else if block.kind === "heading"}
      <h3>{block.text}</h3>
    {:else}
      <p>{block.text}</p>
    {/if}
  {/each}
</article>

<style>
  .license {
    color: var(--color-ink);
    font-size: 13px;
    line-height: 1.65;
  }

  .title {
    margin: 0 0 14px;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
    font-size: 17px;
    font-weight: 700;
  }

  p {
    margin: 0 0 12px;
    color: var(--color-ink-soft);
    overflow-wrap: anywhere;
  }

  h3 {
    margin: 18px 0 6px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  hr {
    margin: 14px 0;
    border: none;
    border-top: 1.5px dashed var(--color-ink-muted);
  }
</style>
