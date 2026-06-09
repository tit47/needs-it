function copyWithExecCommand(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "1px";
  textArea.style.height = "1px";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";

  document.body.appendChild(textArea);

  const isIOS =
    typeof navigator !== "undefined" &&
    /ipad|iphone|ipod/i.test(navigator.userAgent);

  if (isIOS) {
    textArea.contentEditable = "true";
    textArea.readOnly = false;
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    textArea.setSelectionRange(0, text.length);
  } else {
    textArea.focus();
    textArea.select();
  }

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textArea);
  return success;
}

/**
 * Copie du texte dans le presse-papiers — desktop, Android et iOS.
 * La méthode synchrone est tentée en premier pour conserver le « geste
 * utilisateur » requis par Safari iPhone lors d'un clic.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (copyWithExecCommand(text)) {
    return true;
  }

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
