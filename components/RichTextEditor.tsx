"use client";

import { useId, useState } from "react";
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

export function RichTextEditor({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const id = useId();

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
          data={defaultValue ?? ""}
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
            toolbar: [
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
              "link",
              "insertImage",
              "mediaEmbed",
              "htmlEmbed",
              "|",
              "sourceEditing",
            ],
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
                "linkImage",
              ],
              resizeUnit: "%",
            },
            htmlEmbed: { showPreviews: false },
            htmlSupport: {
              allow: [{ name: /^.*$/, styles: true, attributes: true, classes: true }],
            },
          }}
          onChange={(_event, editor) => setHtml(editor.getData())}
        />
      </div>
    </div>
  );
}