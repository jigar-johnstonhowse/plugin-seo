import {
  useWatchForm,
  useAllFormFields,
  useField,
} from "payload/components/forms";
import { useLocale, useConfig } from "payload/components/utilities";
import React, { useEffect, useState, useCallback } from "react";
import UploadInput from "payload/dist/admin/components/forms/field-types/Upload/Input";
import { Props as UploadFieldType } from "payload/dist/admin/components/forms/field-types/Upload/types";
import { Field } from "payload/dist/admin/components/forms/Form/types";
import { PluginConfig } from "../types";
import {
  FieldType,
  Options,
} from "payload/dist/admin/components/forms/useField/types";

type PreviewFieldWithProps = UploadFieldType &
  Field & {
    pluginConfig: PluginConfig;
    path: string;
  };
export const Preview: React.FC<PreviewFieldWithProps | {}> = (props) => {
  const {
    pluginConfig: { generateURL, generateImage },
    label,
    fieldTypes,
    name,
    pluginConfig,
  } = (props as PreviewFieldWithProps) || {}; // TODO: this typing is temporary until payload types are updated for custom field props;
  const field: FieldType<string> = useField(props as Options);
  const relationTo = pluginConfig?.uploadsCollection ?? "";
  const { value, setValue, showError } = field;
  // const { fields } = useWatchForm();
  const [fields] = useAllFormFields();
  const locale = useLocale();

  const config = useConfig();

  const { collections, serverURL, routes: { api } = {} } = config;
  const collection =
    collections?.find((coll) => coll.slug === relationTo) || undefined;

  const {
    "meta.title": { value: metaTitle } = {} as Field,
    "meta.description": { value: metaDescription } = {} as Field,
    "meta.image": { value: metaThumbnail } = {} as Field,
  } = fields;

  const [href, setHref] = useState<string>();

  useEffect(() => {
    const fetchFile = async () => {
      const response = await fetch(`${serverURL}/api/${relationTo}/${metaThumbnail}`, {
        credentials: "include",
      });
      if (response.ok) {
        const json = await response.json();
        setValue(json?.imageurl);
      }
    };
    fetchFile();
  }, [metaThumbnail]);

  useEffect(() => {
    const getHref = async () => {
      if (typeof generateURL === "function" && !href) {
        const newHref = await generateURL({ doc: { fields } });
        setHref(newHref);
      }
    };
    getHref();
  }, [generateURL, fields]);
  const hasImage = Boolean(value);

  return (
    <div>
      <div>Preview</div>
      <div
        style={{
          marginBottom: "5px",
          color: "#9A9A9A",
        }}
      >
        Exact result listings may vary based on content and search relevancy.
      </div>
      <div
        style={{
          padding: "0px",
          borderRadius: "5px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          pointerEvents: "none",
          // maxWidth: "600px",
          width: "100%",
          background: "var(--theme-elevation-50)",
          display: "flex",
        }}
        className="file-details"
      >
        <div
          style={{
          }}
          className="thumbnail thumbnail--size-medium"
        >
          <img
            src={value}
            style={{
              marginBottom: 0,
            }}
          />
        </div>
        <div
          className="file-details__main-detail"
        >
          <div>
            <a
              href={href}
              style={{
                textDecoration: "none",
              }}
            >
              {href || "https://..."}
            </a>
          </div>
          <h4
            style={{
              margin: 0,
            }}
          >
            <a
              href="/"
              style={{
                textDecoration: "none",
              }}
            >
              {metaTitle as string}
            </a>
          </h4>
          <p
            style={{
              margin: 0,
            }}
          >
            {metaDescription as string}
          </p>
        </div>
      </div>
    </div>
  );
};

export const getPreviewField = (props: any) => <Preview {...props} />;
