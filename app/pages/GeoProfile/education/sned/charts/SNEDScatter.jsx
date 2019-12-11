import React from "react";
import { Section } from "@datawheel/canon-core";
import { Plot } from "d3plus-react";
import { simpleGeoChartNeed } from "helpers/MondrianClient";
import { withNamespaces } from "react-i18next";

import { sources } from "helpers/consts";
import { snedColorScale } from "helpers/colors";
import { numeral } from "helpers/formatters";

import { mean } from "d3-array";

import SourceNote from "components/SourceNote";
import SourceTooltip from "components/SourceTooltip";
import ExportLink from "components/ExportLink";
import NoDataAvailable from "components/NoDataAvailable";

class SNEDScatter extends Section {
  state = {
    plot: true
  };
  static need = [
    simpleGeoChartNeed(
      "path_sned_efectiveness_vs_overcoming_by_school",
      "education_sned",
      [
        "Avg efectiveness",
        "Avg overcoming",
        "Avg sned_score",
        "Avg initiative",
        "Avg integration",
        "Avg improvement",
        "Avg fairness"
      ],
      {
        drillDowns: [
          ["Institutions", "Institution", "Institution"],
          ["Cluster", "Cluster", "Stage 1a"]
        ],
        cuts: [`[Date].[Date].[Year].&[${sources.sned.year}]`],
        options: { parents: true }
      }
    ),
    simpleGeoChartNeed(
      "path_sned_efectiveness_vs_overcoming_by_school_chile",
      "education_sned",
      [
        "Avg efectiveness",
        "Avg overcoming",
        "Avg sned_score",
        "Avg initiative",
        "Avg integration",
        "Avg improvement",
        "Avg fairness"
      ],
      {
        drillDowns: [
          ["Geography", "Geography", "Comuna"],
          ["Cluster", "Cluster", "Stage 1a"]
        ],
        cuts: [`[Date].[Date].[Year].&[${sources.sned.year}]`],
        options: { parents: true }
      }
    )
  ];

  render() {
    const { t, className, i18n } = this.props;
    const {
      geo,
      path_sned_efectiveness_vs_overcoming_by_school,
      path_sned_efectiveness_vs_overcoming_by_school_chile
    } = this.context.data;

    // const path =
    //   geo && national
    //     ? path_sned_efectiveness_vs_overcoming_by_school_chile
    //     : path_sned_efectiveness_vs_overcoming_by_school;

    const measures = [
      "Avg efectiveness",
      "Avg overcoming",
      "Avg initiative",
      "Avg integration",
      "Avg improvement",
      "Avg fairness",
      "Avg sned_score"
    ];

    let path =
      geo.type == "comuna"
        ? `/api/data?measures=${measures.join(
            ","
          )}&drilldowns=Stage 1a,Institution,Year&Comuna=${
            geo.key
          }&parents=true`
        : geo.type == "region"
        ? `/api/data?measures=${measures.join(
            ","
          )}&drilldowns=Stage 1a,Institution,Year&Region=${
            geo.key
          }&parents=true`
        : `/api/data?measures=${measures.join(
            ","
          )}&drilldowns=Stage 1a,Comuna,Year&parents=true`;

    const locale = i18n.language;
    const classSvg = "psu-nem-scatter";

    return (
      <div className={className + " prevent-legend-hover"}>
        <h3 className="chart-title">
          <span>
            {geo.key === "chile"
              ? t("Efectiveness vs Overcoming by Comuna & Type")
              : t("Efectiveness vs Overcoming by School")}
            <SourceTooltip cube="sned" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>
        {this.state.plot ? (
          <Plot
            className={classSvg}
            config={{
              height: 400,
              data: path,
              aggs: {
                "ID Stage 1a": mean
              },
              groupBy: geo.key === "chile"
                ? ["ID Comuna", "ID Stage 1a"]
                : ["ID Institution", "ID Stage 1a"],
              label: d => d["Institution"],
              x: "Avg efectiveness",
              y: "Avg overcoming",
              size: geo.type == "comuna" ? d => 10 : d => 5,
              sizeMax: geo.type == "comuna" ? 10 : 5,
              //colorScalePosition: false,
              shapeConfig: {
                fill: d => snedColorScale("sned" + d["ID Stage 1a"])
              },
              xConfig: {
                title: t("Efectiveness")
              },
              x2Config: {
                barConfig: {
                  "stroke-width": 0
                }
              },
              yConfig: {
                title: t("Overcoming")
              },
              tooltip: d => {
                if (d["Institution"] === "hack") {
                  return "";
                }
              },
              tooltipConfig: {
                title: d => {
                  if (d["Institution"] !== "hack") {
                    var title = "";
                    if (d["ID Institution"]) {
                      title =
                        d["ID Institution"] instanceof Array
                          ? d["Stage 1a"]
                          : d["Institution"] + " - " + d["Stage 1a"];
                    }
                    if (d["ID Comuna"]) {
                      title =
                        d["ID Comuna"] instanceof Array
                          ? d["Stage 1a"]
                          : d["Comuna"] +
                            " (" +
                            d["Region"] +
                            ") - " +
                            d["Stage 1a"];
                    }

                    return title;
                  }
                },
                body: d => {
                  if (d["Institution"] !== "hack") {
                    var body = "";
                    if (
                      (d["ID Institution"] &&
                        !(d["ID Institution"] instanceof Array)) ||
                      (d["ID Comuna"] && !(d["ID Comuna"] instanceof Array))
                    ) {
                      body = "<table class='tooltip-table'>";
                      body +=
                        "<tr><td class='title'>" +
                        t("Efectiveness") +
                        "</td><td class='data'>" +
                        numeral(d["Avg efectiveness"], locale).format(
                          "(0.[0])"
                        ) +
                        "</td></tr>";
                      body +=
                        "<tr><td class='title'>" +
                        t("Overcoming") +
                        "</td><td class='data'>" +
                        numeral(d["Avg overcoming"], locale).format("(0.0)") +
                        "</td></tr>";
                      body +=
                        "<tr><td class='title'>" +
                        t("Initiative") +
                        "</td><td class='data'>" +
                        numeral(d["Avg initiative"], locale).format("(0.0)") +
                        "</td></tr>";
                      body +=
                        "<tr><td class='title'>" +
                        t("Integration") +
                        "</td><td class='data'>" +
                        numeral(d["Avg integration"], locale).format("(0.0)") +
                        "</td></tr>";
                      body +=
                        "<tr><td class='title'>" +
                        t("Improvement") +
                        "</td><td class='data'>" +
                        numeral(d["Avg improvement"], locale).format("(0.0)") +
                        "</td></tr>";
                      body +=
                        "<tr><td class='title'>" +
                        t("SNED Score") +
                        "</td><td class='data'>" +
                        numeral(d["Avg sned_score"], locale).format("(0.0)") +
                        "</td></tr>";
                      body += "</table>";
                    }
                    return body;
                  }
                }
              },
              legendTooltip: {
                title: d => d["Stage 1a"],
                body: d => ""
              },
              legendConfig: {
                label: d => {
                  if (d["Institution"] !== "hack") {
                    var label = "";
                    if (d["ID Institution"]) {
                      label =
                        d["ID Institution"] instanceof Array
                          ? d["Stage 1a"]
                          : d["Institution"] + " - " + d["Stage 1a"];
                    }
                    if (d["ID Comuna"]) {
                      label =
                        d["ID Comuna"] instanceof Array
                          ? d["Stage 1a"]
                          : d["Comuna"] +
                            " (" +
                            d["Region"] +
                            ") - " +
                            d["Stage 1a"];
                    }
                    return label;
                  }
                }
                // label: d => d["ID Institution"],
                // shapeConfig: {
                //   backgroundImage: d =>
                //     "/images/legend/college/administration.png"
                // }
              }
            }}
            dataFormat={data => {
              const d = data.data.filter(f => {
                return f["Avg efectiveness"] && f["Avg overcoming"];
              });
              if (d && d.length > 1) {
                return d;
              } else if (d.length === 1) {
                d.push({
                  //...d[0],
                  "ID Institution": 999999999,
                  Institution: "hack",
                  "Number of records": 0,
                  "Avg efectiveness": d[0]["Avg efectiveness"] + 8,
                  "Avg overcoming": d[0]["Avg overcoming"] + 8,
                  "Avg sned_score": 1
                });
                d.push({
                  //...d[0],
                  "ID Institution": 999999998,
                  Institution: "hack",
                  "Number of records": 0,
                  "Avg efectiveness": d[0]["Avg efectiveness"] - 8,
                  "Avg overcoming": d[0]["Avg overcoming"] - 8,
                  "Avg sned_score": 1
                });
                return d;
              } else {
                this.setState({ plot: false });
              }
            }}
          />
        ) : (
          <NoDataAvailable />
        )}
      </div>
    );
  }
}
export default withNamespaces()(SNEDScatter);
