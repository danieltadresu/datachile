import React from "react";
import { Section } from "@datawheel/canon-core";
import CustomMap from "components/CustomMap";
import { withNamespaces } from "react-i18next";

import mondrianClient, { levelCut } from "helpers/MondrianClient";
import { getLevelObject } from "helpers/dataUtils";

import { sources } from "helpers/consts";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";

class ExportsGeoMap extends Section {
  static need = [
    (params, store) => {
      const product = getLevelObject(params);
      const prm = mondrianClient.cube("imports").then(cube => {
        var q = levelCut(
          product,
          "Import HS",
          "HS",
          cube.query
            .option("parents", true)
            .drilldown("Origin Country", "Country", "Country")
            .drilldown("Date", "Date", "Year")
            .measure("CIF US")
            .cut(`[Date].[Year].&[${sources.imports.year}]`)
            .property("Origin Country", "Country", "iso3"),
          "HS0",
          "HS2",
          store.i18n.locale
        );

        return {
          key: "product_imports_by_origin_last_year",
          data: __API__ + q.path("jsonrecords")
        };
      });

      return {
        type: "GET_DATA",
        promise: prm
      };
    }
  ];
  render() {
    const { t, className, i18n } = this.props;
    const path = this.context.data.product_imports_by_origin_last_year;

    const locale = i18n.language;
    const classSvg = "imports";

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("Imports By Origin") +
              " " +
              t("in") +
              " " +
              sources.imports.year}
            <SourceTooltip cube="imports" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>
        <CustomMap path={path} msrName={"CIF US"} className={"imports"} />
      </div>
    );
  }
}

export default withNamespaces()(ExportsGeoMap);
