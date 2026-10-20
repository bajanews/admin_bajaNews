"use client";

import { useEffect, useId, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Font,
  Link,
  List,
  TodoList,
  Indent,
  IndentBlock,
  Alignment,
  RemoveFormat,
  SourceEditing,
  PasteFromOffice,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageResize,
  ImageInsert,
  LinkImage,
  SimpleUploadAdapter,
  MediaEmbed,
  HtmlEmbed,
  GeneralHtmlSupport,
} from "ckeditor5";
import esTranslations from "ckeditor5/translations/es.js";

import "ckeditor5/ckeditor5.css";

function leerBorrador(key?: string): string | null {
  if (!key || typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

const SELECTOR_EMBEDS = [
  "blockquote.instagram-media",
  "blockquote.twitter-tweet",
  "blockquote.tiktok-embed",
  "div.fb-post",
  "div.fb-video",
  "iframe",
].join(",");

const PISTA_EMBEDS = /instagram-media|twitter-tweet|tiktok-embed|fb-post|fb-video|<iframe|<script/i;

function envolverEmbeds(html: string): string {
  if (!html || typeof window === "undefined" || !PISTA_EMBEDS.test(html)) return html;

  const doc = new DOMParser().parseFromString(`<div id="bn-raiz">${html}</div>`, "text/html");
  const raiz = doc.getElementById("bn-raiz");
  if (!raiz) return html;

  const yaProtegido = (el: Element) => Boolean(el.closest(".raw-html-embed, [data-oembed-url]"));

  const crearBloque = () => {
    const bloque = doc.createElement("div");
    bloque.className = "raw-html-embed";
    return bloque;
  };

  for (const embed of Array.from(raiz.querySelectorAll(SELECTOR_EMBEDS))) {
    if (yaProtegido(embed) || embed.parentElement?.closest(SELECTOR_EMBEDS)) continue;

    let objetivo: Element = embed;
    const padre = embed.parentElement;
    if (
      padre &&
      padre !== raiz &&
      ["P", "DIV", "FIGURE"].includes(padre.tagName) &&
      padre.textContent?.trim() === embed.textContent?.trim()
    ) {
      objetivo = padre;
    }

    const bloque = crearBloque();
    objetivo.replaceWith(bloque);
    bloque.appendChild(objetivo);

    let siguiente = bloque.nextElementSibling;
    while (siguiente && siguiente.tagName === "SCRIPT") {
      const actual = siguiente;
      siguiente = siguiente.nextElementSibling;
      bloque.appendChild(actual);
    }
  }

  for (const script of Array.from(raiz.querySelectorAll("script"))) {
    if (yaProtegido(script)) continue;
    const bloque = crearBloque();
    script.replaceWith(bloque);
    bloque.appendChild(script);
  }

  return raiz.innerHTML;
}

const FUENTE_NOTA = "Roboto, Arial, sans-serif";
const BLOQUES_DE_TEXTO = new Set(["P", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "TD", "TH", "DIV"]);
const BLOQUES_CONTENEDORES = "p,div,ul,ol,li,table,thead,tbody,tr,td,th,h1,h2,h3,h4,h5,h6,blockquote,figure,section,article";

const ESTILOS_DEL_PEGADO = /^(font-family|font-size|font|line-height|color|background|background-color|mso-.*)$/i;

function limpiarPegado(html: string): string {
  const doc = new DOMParser().parseFromString(`<div id="bn-pegado">${html}</div>`, "text/html");
  const raiz = doc.getElementById("bn-pegado");
  if (!raiz) return html;

  for (const el of Array.from(raiz.querySelectorAll<HTMLElement>("*"))) {
    if (el.closest(".raw-html-embed")) continue;

    for (const estilo of Array.from(el.style)) {
      if (ESTILOS_DEL_PEGADO.test(estilo)) el.style.removeProperty(estilo);
    }
    if (el.getAttribute("style")?.trim() === "") el.removeAttribute("style");

    if (el.tagName === "FONT") {
      el.removeAttribute("face");
      el.removeAttribute("size");
      el.removeAttribute("color");
    }

    for (const clase of Array.from(el.classList)) {
      if (/^(Mso|docs-|c\d+$)/.test(clase)) el.classList.remove(clase);
    }
    if (el.getAttribute("class")?.trim() === "") el.removeAttribute("class");
  }

  for (const el of Array.from(raiz.querySelectorAll<HTMLElement>("*"))) {
    if (!BLOQUES_DE_TEXTO.has(el.tagName) || el.closest(".raw-html-embed")) continue;
    if (el.querySelector(BLOQUES_CONTENEDORES)) continue;
    if (!el.textContent?.trim()) continue;

    if (!el.style.textAlign) el.style.textAlign = "justify";

    const envoltura = doc.createElement("span");
    envoltura.style.fontFamily = FUENTE_NOTA;
    while (el.firstChild) envoltura.appendChild(el.firstChild);
    el.appendChild(envoltura);
  }

  return raiz.innerHTML;
}

export function RichTextEditor({
  name,
  label,
  defaultValue,
  hint,
  storageKey,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  storageKey?: string;
}) {
  const [inicial] = useState(() => envolverEmbeds(leerBorrador(storageKey) ?? defaultValue ?? ""));
  const [html, setHtml] = useState(inicial);
  const id = useId();

  useEffect(() => {
    return () => {
      if (storageKey) {
        try {
          window.sessionStorage.removeItem(storageKey);
        } catch {}
      }
    };
  }, [storageKey]);

  return (
    <div className="col-span-4">
      <label htmlFor={id} className="block mb-1.5 text-sm font-semibold text-[var(--color-ink)]">
        {label}
        {hint && <span className="ml-1.5 font-normal text-[var(--color-ink-soft)]">{hint}</span>}
      </label>

      <input type="hidden" name={name} value={html} />

      <div
        id={id}
        className="editor-nota rounded-md overflow-hidden border-2"
        style={{ borderColor: "var(--color-input-border)" }}
      >
        <CKEditor
          editor={ClassicEditor}
          data={inicial}
          config={{
            licenseKey: "GPL",
            language: "es",
            translations: [esTranslations],
            plugins: [
              Essentials,
              Paragraph,
              Heading,
              Bold,
              Italic,
              Underline,
              Strikethrough,
              Font,
              Link,
              List,
              TodoList,
              Indent,
              IndentBlock,
              Alignment,
              RemoveFormat,
              SourceEditing,
              PasteFromOffice,
              HorizontalLine,
              Image,
              ImageCaption,
              ImageStyle,
              ImageToolbar,
              ImageResize,
              ImageInsert,
              LinkImage,
              SimpleUploadAdapter,
              MediaEmbed,
              HtmlEmbed,
              GeneralHtmlSupport,
            ],
            toolbar: {
              shouldNotGroupWhenFull: true,
              items: [
                "heading",
                "|",
                "fontFamily",
                "fontSize",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "removeFormat",
                "|",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "alignment",
                "|",
                "bulletedList",
                "numberedList",
                "todoList",
                "|",
                "outdent",
                "indent",
                "|",
                "horizontalLine",
                "link",
                "insertImage",
                "mediaEmbed",
                "htmlEmbed",
                "|",
                "sourceEditing",
              ],
            },
            fontFamily: {
              options: [
                "default",
                FUENTE_NOTA,
                "Arial, Helvetica, sans-serif",
                "Georgia, serif",
                "Times New Roman, Times, serif",
                "Verdana, Geneva, sans-serif",
              ],
            },
            link: {
              defaultProtocol: "https://",
              decorators: {
                abrirEnPestanaNueva: {
                  mode: "manual",
                  label: "Abrir en una pestaña nueva",
                  defaultValue: false,
                  attributes: {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
              },
            },
            simpleUpload: {
              uploadUrl: "/api/upload-image",
            },
            image: {
              toolbar: [
                "imageTextAlternative",
                "toggleImageCaption",
                "|",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "|",
                "resizeImage",
                "|",
                "linkImage",
              ],
              resizeUnit: "px",
              resizeOptions: [
                { name: "resizeImage:original", value: null, label: "Original" },
                { name: "resizeImage:custom", value: "custom", label: "Personalizado (px)" },
                { name: "resizeImage:300", value: "300", label: "300 px" },
                { name: "resizeImage:500", value: "500", label: "500 px" },
                { name: "resizeImage:700", value: "700", label: "700 px" },
              ],
            },
            mediaEmbed: {
              previewsInData: true,
            },
            htmlEmbed: { showPreviews: false },
            htmlSupport: {
              allow: [{ name: /^.*$/, styles: true, attributes: true, classes: true }],
            },
          }}
          onReady={(editor) => {
            editor.model.enqueueChange({ isUndoable: false }, (writer) => {
              const root = editor.model.document.getRoot();
              if (!root) return;
              const parrafos = Array.from(writer.createRangeIn(root).getItems()).filter(
                (item) => item.is("element", "paragraph") && !item.hasAttribute("alignment")
              );
              for (const parrafo of parrafos) writer.setAttribute("alignment", "justify", parrafo);
            });

            const clipboard = editor.plugins.get("ClipboardPipeline");
            clipboard.on(
              "inputTransformation",
              (_evt, data) => {
                const html = editor.data.htmlProcessor.toData(data.content);
                data.content = editor.data.htmlProcessor.toView(limpiarPegado(html));
              },
              { priority: "low" }
            );
          }}
          onChange={(_event, editor) => {
            const data = editor.getData();
            setHtml(data);
            if (storageKey) {
              try {
                window.sessionStorage.setItem(storageKey, data);
              } catch {}
            }
          }}
        />
      </div>
    </div>
  );
}