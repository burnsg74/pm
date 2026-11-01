<script>
  import { app } from "../lib/state.svelte.js";

  // App.svelte mounts this inside {#key app.prompt}, so each prompt starts fresh.
  const prompt = app.prompt;
  let value = $state(prompt.value ?? "");

  const preview = $derived(prompt.preview?.(value) ?? "");

  async function submit() {
    const result = await prompt.onsubmit(value);
    if (result === false) return;
    if (typeof result === "string") {
      prompt.error = result;
      return;
    }
    // onsubmit may have opened a follow-up prompt; only close our own.
    if (app.prompt !== prompt) return;
    if (prompt.repeat) {
      value = "";
      prompt.error = "";
      prompt.count += 1;
    } else {
      app.closePrompt();
    }
  }

  function cancel() {
    prompt.oncancel?.();
    if (app.prompt === prompt) app.closePrompt();
  }

  function onkeydown(e) {
    if (e.isComposing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (prompt.multiline && prompt.saveOnEscape) submit().then(() => app.prompt === prompt && app.closePrompt());
      else cancel();
    } else if (e.key === "Enter" && (!prompt.multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (prompt.multiline) submit().then(() => app.prompt === prompt && app.closePrompt());
      else submit();
    }
  }

  function oninput() {
    prompt.error = "";
    prompt.oninput?.(value);
  }

  function focusInput(el) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }
</script>

<div class="scrim" role="presentation" onclick={(e) => e.target === e.currentTarget && cancel()}>
  <div class="box" class:multi={prompt.multiline} role="dialog" aria-label={prompt.title} tabindex="-1">
    <div class="title">
      <span>{prompt.title}</span>
      {#if prompt.count}<span class="count">{prompt.count} added</span>{/if}
    </div>
    {#if prompt.multiline}
      <textarea bind:value {onkeydown} {oninput} rows="9" spellcheck="true" placeholder={prompt.placeholder ?? ""} {@attach focusInput}></textarea>
    {:else}
      <input bind:value {onkeydown} {oninput} placeholder={prompt.placeholder ?? ""} spellcheck="false" autocomplete="off" {@attach focusInput} />
    {/if}
    <div class="under">
      {#if prompt.error}
        <span class="error">{prompt.error}</span>
      {:else if preview}
        <span class="preview">{preview}</span>
      {:else if prompt.hint}
        <span class="hint">{prompt.hint}</span>
      {:else}
        <span class="hint"><kbd>↵</kbd> save · <kbd>esc</kbd> cancel</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: var(--scrim);
    display: grid;
    place-items: start center;
    padding-top: 16vh;
    z-index: 60;
  }
  .box {
    width: min(640px, 92vw);
    background: var(--bg-elev);
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    box-shadow: var(--shadow);
    padding: 12px 14px 10px;
  }
  .title {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--green);
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .count {
    color: var(--fg-dim);
  }
  input,
  textarea {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    font-size: 15px;
    color: var(--fg-bright);
    padding: 8px 10px;
    background: var(--bg);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    user-select: text;
  }
  textarea {
    display: block;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.55;
    resize: none;
  }
  input:focus,
  textarea:focus {
    border-color: var(--green);
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--fg-faint);
  }
  .under {
    min-height: 20px;
    padding-top: 7px;
    font-size: 12px;
  }
  .preview {
    color: var(--accent);
  }
  .hint {
    color: var(--fg-faint);
  }
  .error {
    color: var(--red);
  }
</style>
