import React from "react";
import { Section } from "datawheel-canon";
import { translate } from "react-i18next";

import { simpleGeoChartNeed } from "helpers/MondrianClient";
import { employmentBySexColorScale } from "helpers/colors";
import { numeral } from "helpers/formatters";

import Select from "components/Select";
import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";
// import CustomStackedArea from "components/CustomStackedArea";

import { StackedArea } from "d3plus-react";

class EmploymentBySex extends Section {
  static need = [
    (params, store) => {
      return simpleGeoChartNeed(
        "path_employment_by_sex",
        "nene_quarter",
        ["Expansion factor"],
        {
          drillDowns: [
            [
              "Occupational Situation",
              "Occupational Situation",
              "Occupational Situation"
            ],
            ["Sex", "Sex", "Sex"],
            ["Date", "Date", "Moving Quarter"]
          ]
        }
      )(params, store);
    }
  ];

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      selectedOption: 0,
      selectedObj: {
        path: "",
        groupBy: [],
        label: () => "",
        sum: () => "",
        sex_id: 1
      },
      chartVariations: []
    };
  }

  componentDidMount() {
    const { t } = this.props;

    var variations = [
      {
        id: 0,
        title: t("Female"),
        sex_id: 1
      },
      {
        id: 1,
        title: t("Male"),
        sex_id: 2
      }
    ];

    this.setState({
      selectedOption: 0,
      selectedObj: variations[0],
      chartVariations: variations
    });
  }

  handleChange(ev) {
    this.setState({ key: Math.random() });

    this.setState({
      selectedOption: ev.newValue,
      selectedObj: this.state.chartVariations[ev.newValue]
    });
  }

  render() {
    const { t, className, i18n } = this.props;
    const { chartVariations, key, selectedObj, selectedOption } = this.state;

    const locale = i18n.language;

    // path for data
    const path = this.context.data.path_employment_by_sex;

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("Regional Employment By Sex")}
            <SourceTooltip cube="nene" />
          </span>
          <ExportLink path={path} />
        </h3>
        <StackedArea
          forceUpdate={this.state.selectedObj.sex_id}
          config={{
            height: 400,
            data: path,
            groupBy: ["variable"],
            label: d => d["variable"],
            filter: d => d.__SEX__ === this.state.selectedObj.sex_id,
            x: "month",
            y: "percentage",
            time: "month",
            timeline: false,
            scale: "time",
            xConfig: {
              title: false
            },
            yConfig: {
              title: t("People"),
              tickFormat: tick => numeral(tick, locale).format("0%")
            },
            shapeConfig: {
              fill: d => employmentBySexColorScale("bysex" + d["variable"])
            },
            tooltipConfig: {
              title: d => d["variable"],
              body: d => {
                return d["month"] instanceof Array
                  ? ""
                  : numeral(d["percentage"], locale).format("0.[0]%") +
                      " " +
                      t("people") +
                      "<br/>" +
                      t("Mobile Quarter") +
                      " " +
                      d["quarter"];
              }
            }
          }}
          dataFormat={data => {

            const dataBySex = data.data.reduce(
              (all, item) => {
                all[item["ID Sex"]].push(item);
                return all;
              },
              { "1": [], "2": [] }
            );

            const output = [];

            Object.keys(dataBySex).forEach(d => {
              var melted = [];
              var total = {};

              dataBySex[d].forEach(f => {
                if (total[f["ID Moving Quarter"]]) {
                  total[f["ID Moving Quarter"]] += f["Expansion factor"];
                } else {
                  total[f["ID Moving Quarter"]] = f["Expansion factor"];
                }
                var a = f;
                var date = f["ID Moving Quarter"].split("_");
                f["month"] = date[0] + "-" + date[1] + "-01";
                f["quarter"] =
                  date[0] +
                  " (" +
                  date[1] +
                  "," +
                  date[2] +
                  "," +
                  date[3] +
                  ")";
                a["variable"] = f["Occupational Situation"];
                a["value"] = f["Expansion factor"];
                melted.push(a);
              });

              melted = melted
                .map(m => {
                  m["percentage"] = m["value"] / total[m["ID Moving Quarter"]];
                  m.__SEX__ = parseInt(d);
                  return m;
                })
                .sort((a, b) => {
                  return a["Month"] > b["Month"] ? 1 : -1;
                });

              output.push(...melted);
            });

            return output;
          }}
        />

        <Select
          id="variations"
          options={chartVariations}
          value={selectedOption}
          labelField="title"
          valueField="id"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default translate()(EmploymentBySex);
