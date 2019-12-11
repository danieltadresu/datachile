import React from "react";

import { Treemap } from "d3plus-react";
import mondrianClient, {
  setLangCaptions,
  getMeasureByGeo
} from "helpers/MondrianClient";
import { getGeoObject } from "helpers/dataUtils";
import { ordinalColorScale } from "helpers/colors";
import { numeral } from "helpers/formatters";
import { withNamespaces } from "react-i18next";
import { Section } from "@datawheel/canon-core";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";

class SpendingByIndustry extends Section {
  static need = [
    (params, store) => {
      const geo = getGeoObject(params);

      const regionID =
        typeof geo.ancestor != "undefined" ? geo.ancestor.key : "";
      const measureName = getMeasureByGeo(
        geo.type,
        "Total Spending",
        "gasto_region_" + geo.key,
        "gasto_region_" + regionID
      );

      const prm = mondrianClient.cube("rd_survey").then(cube => {
        var q = setLangCaptions(
          cube.query
            .option("parents", true)
            .drilldown("Date", "Date", "Year")
            .drilldown("ISICrev4", "ISICrev4", "Level 1")
            .measure(measureName),
          store.i18n.locale
        );

        return {
          key: "path_spending_by_industry",
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
    const path = this.context.data.path_spending_by_industry;
    const { t, className, i18n } = this.props;
    const locale = i18n.language;
    const geo = this.context.data.geo;
    const regionID = geo.type === "comuna" ? geo.ancestors[0].key : "";
    const measureName = getMeasureByGeo(
      geo.type,
      "Total Spending",
      "gasto_region_" + geo.key,
      "gasto_region_" + regionID
    );

    const classSvg = "spending-by-industry";

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("R&D Spending By Industry")}{" "}
            {geo && geo.type == "comuna" && t("Regional")}
            <SourceTooltip cube="rd_survey" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>
        <Treemap
          className={classSvg}
          config={{
            height: 400,
            data: path,
            groupBy: "ID Level 1",
            label: d => d["Level 1"],
            sum: d => d[measureName],
            time: "ID Year",
            total: d => d[measureName],
            totalConfig: {
              text: d => "Total: US $ " + d.text.split(": ")[1]
            },
            shapeConfig: {
              fill: d => ordinalColorScale(d["ID Level 1"])
            },
            legend: false,
            legendConfig: {
              label: false,
              shapeConfig: {
                fill: d => ordinalColorScale(d["ID Level 1"]),
                backgroundImage: d =>
                  "https://datausa.io/static/img/attrs/thing_apple.png"
              }
            }
          }}
          dataFormat={data => data.data}
        />
      </div>
    );
  }
}

export default withNamespaces()(SpendingByIndustry);
