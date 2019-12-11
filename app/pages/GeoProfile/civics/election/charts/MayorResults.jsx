import {Switch} from "@blueprintjs/core";
import {Section} from "@datawheel/canon-core";
import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";
import {Treemap} from "d3plus-react";
import {coalitionColorScale, independentColorScale} from "helpers/colors";
import {getGeoObject} from "helpers/dataUtils";
import {numeral} from "helpers/formatters";
import {simpleDatumNeed, simpleGeoChartNeed} from "helpers/MondrianClient";
import React from "react";
import {withNamespaces} from "react-i18next";

class MayorResults extends Section {
  static need = [
    (params, store) =>
      simpleDatumNeed(
        "need_mayor_participation",
        "election_participation",
        ["Electors", "Votes"],
        {
          drillDowns: [["Date", "Date", "Year"]],
          options: {parents: true},
          cuts: ["[Election Type].[Election Type].[Election Type].&[5]"]
        },
        "geo",
        false
      )(params, store),
    (params, store) => {
      const geo = getGeoObject(params);

      if (geo.type === "comuna") {
        return simpleGeoChartNeed(
          "path_mayor_results",
          "election_results_update",
          ["Votes"],
          {
            drillDowns: [
              ["Candidates", "Candidates", "Candidate"],
              ["Party", "Party", "Partido"],
              ["Date", "Date", "Year"]
            ],
            options: {parents: true},
            cuts: ["[Election Type].[Election Type].[Election Type].&[5]"]
          }
        )(params, store);
      }
      else {
        return simpleGeoChartNeed(
          "path_mayor_results",
          "election_results_update",
          ["Number of records", "Votes"],
          {
            drillDowns: [["Party", "Party", "Partido"], ["Date", "Date", "Year"]],
            options: {parents: true},
            cuts: [
              "[Election Type].[Election Type].[Election Type].&[5]",
              "[Elected].[Elected].[Elected].&[1]"
            ]
          }
        )(params, store);
      }
    }
  ];

  constructor(props) {
    super(props);

    this.state = {
      non_electors: true
    };

    this.toggleElectors = this.toggleElectors.bind(this);
  }

  toggleElectors() {
    this.setState(prevState => ({
      non_electors: !prevState.non_electors
    }));
  }

  render() {
    const path = this.context.data.path_mayor_results;
    const {t, className, i18n} = this.props;
    const geo = this.context.data.geo;
    let non_electors = null;
    let data_election = this.context.data.need_mayor_participation;

    if (geo.depth === 2) {
      non_electors = data_election.data[0].Electors - data_election.data[0].Votes;
    }

    const locale = i18n.language;
    const classSvg = "mayor-election";
    let i = 0;

    const pactos = [
      {key: 4, name: "Chile Vamos", ids: [3, 6, 7, 23]},
      {key: 13, name: "Nueva Mayoría", ids: [1, 2, 9, 10, 11, 14]},
      //{ key: 2, name: "Otras coaliciones", ids: [4, 12, 13, 15, 25, 16, 5] },
      {key: 2, name: "Independiente", ids: []}
    ];

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("Mayor Election")}
            <SourceTooltip cube="election_results" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>

        <Treemap
          className={classSvg}
          config={{
            height: 400,
            data: path,
            filter: this.state.non_electors ? "" : d => d["ID Candidate"] !== 9999,
            total: d => (geo.type === "comuna" ? d["Votes"] : d["Number of records"]),
            totalConfig: {
              text:
                !this.state.non_electors && geo.type === "comuna"
                  ? d =>
                      d.text +
                      " " +
                      (geo.type === "comuna" ? t("Votes") : t("Elected Authority"))
                  : d =>
                      d.text +
                      " " +
                      (geo.type === "comuna"
                        ? t("Enabled Voters")
                        : t("Elected Authority"))
            },
            groupBy:
              geo.type === "comuna" ? ["ID Candidate"] : ["ID Coalition", "ID Partido"],
            label: d => (geo.type === "comuna" ? d["Candidate"] : d["Partido"]),
            sum: d => (geo.type === "comuna" ? d["Votes"] : d["Number of records"]),
            time: "ID Year",
            shapeConfig: {
              fill: d => {
                const coalition =
                  [4, 13].includes(d["ID Coalition"]) ||
                  (d["ID Coalition"] === 0 && d["ID Partido"] === 0)
                    ? coalitionColorScale.find(co => co.keys.includes(d["ID Coalition"]))
                    : {
                        keys: [],
                        elected: independentColorScale("ca" + d["ID Candidate"]),
                        no_elected: independentColorScale("ca" + d["ID Candidate"]),
                        base: independentColorScale("ca" + d["ID Candidate"]),
                        slug: "sin-asignar"
                      };

                return d["ID Candidate"] !== 9999 ? coalition.base : "#BDBED6";
              }
            },
            tooltipConfig: {
              //title: d => d["ID Partido"],
              body: d =>
                "<div>" +
                "<div>" +
                (geo.type === "comuna"
                  ? numeral(d["Votes"], locale).format("0,0")
                  : numeral(d["Number of records"], locale).format("0,0")) +
                " " +
                (geo.type === "comuna" ? t("Votes") : t("Elected Authority")) +
                "</div>" +
                "<div>" +
                (geo.type === "comuna" && d["Partido"] !== "#null" ? d["Partido"] : "") +
                " " +
                "</div>" +
                "</div>"
            },
            legendTooltip: {
              title: d => (geo.type === "comuna" ? d["Candidate"] : d["Pacto"])
            },
            legend: false
          }}
          dataFormat={data => {
            const d = data.data.map(item => {
              let pacto = pactos.find(subitem =>
                subitem.ids.includes(item["ID Partido"])
              );
              return {
                ...item,
                Pacto: pacto ? pacto.name : t("Others"),
                "ID Coalition": pacto ? pacto.key : 0
              };
            });
            if (geo.type === "comuna")
              d.push({
                Votes: non_electors,
                Candidate: t("Electors that didn't vote").toUpperCase(),
                ["ID Candidate"]: 9999,
                ["ID Partido"]: 9999,
                ["ID Year"]: 2016,
                Partido: "",
                Year: "2016"
              });
            return d;
          }}
        />

        {geo.depth === 2 && (
          <div>
            <Switch
              onClick={this.toggleElectors}
              label={t("Total Electors")}
              defaultChecked={this.state.non_electors}
            />
          </div>
        )}
      </div>
    );
  }
}

export default withNamespaces()(MayorResults);
