import React from "react";
import { Section } from "@datawheel/canon-core";
import { BarChart } from "d3plus-react";
import { withNamespaces } from "react-i18next";

import { simpleGeoChartNeed } from "helpers/MondrianClient";
import { getGeoObject } from "helpers/dataUtils";
import { COLORS_GENDER } from "helpers/colors";
import { numeral } from "helpers/formatters";

import { mean } from "d3-array";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";

class DisabilityBySex extends Section {
  static need = [
    (params, store) => {
      let geo = getGeoObject(params);
      if (geo.type === "comuna") {
        geo = { ...geo.ancestor };
      }
      return simpleGeoChartNeed(
        "path_health_disabilities_by_sex",
        "disabilities",
        ["Expansion Factor Region"],
        {
          drillDowns: [
            ["Sex", "Sex", "Sex"],
            ["Disability Grade", "Disability Grade", "Disability Grade"],
            ["Date", "Date", "Year"]
          ],
          options: { parents: true },
          cuts: [
            "{[Disability Grade].[Disability Grade].[Disability Grade].&[2],[Disability Grade].[Disability Grade].[Disability Grade].&[3]}"
          ]
        }
      )(params, store);
    }
  ];

  render() {
    const path = this.context.data.path_health_disabilities_by_sex;
    const { t, className, i18n } = this.props;
    const geo = this.context.data.geo;

    (params, store) => {
      let geo = getGeoObject(params);
    };

    const locale = i18n.language;
    const classSvg = "disabilities-by-sex";

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("Disabilities by Sex")}
            <SourceTooltip cube="disabilities" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>
        <BarChart
          className={classSvg}
          config={{
            height: 400,
            data: path,
            aggs: {
              ["ID Sex"]: mean
            },
            groupBy: ["Sex"],
            label: d => t(d["Sex"]),
            y: d => d["Expansion Factor Region"],
            x: d => d["Disability Grade"],
            //discrete: "y",
            stacked: true,
            barPadding: 20,
            groupPadding: 40,
            time: "ID Year",
            shapeConfig: {
              fill: d => COLORS_GENDER[d["ID Sex"]]
            },
            xConfig: {
              tickSize: 0,
              title: false
            },
            yConfig: {
              title: t("People with disabilities"),
              tickFormat: tick => numeral(tick, locale).format("(0.[0]a)")
            },
            tooltipConfig: {
              title: d => t(d["Sex"]),
              body: d =>
                numeral(d["Expansion Factor Region"], locale).format(
                  "( 0 a )"
                ) +
                " " +
                t("People with disabilities")
            },
            legendConfig: {
              label: false,
              shapeConfig: {
                backgroundImage: d =>
                  "/images/legend/sex/" + d["ID Sex"] + ".png"
              }
            }
          }}
          dataFormat={data => data.data}
        />
      </div>
    );
  }
}

export default withNamespaces()(DisabilityBySex);
