import React from "react";
import { Section } from "@datawheel/canon-core";
import { withNamespaces } from "react-i18next";
import { BarChart } from "d3plus-react";
import { Switch } from "@blueprintjs/core";

import mondrianClient, { levelCut } from "helpers/MondrianClient";
import { getLevelObject } from "helpers/dataUtils";
import { COLORS_GENDER } from "helpers/colors";
import { numeral } from "helpers/formatters";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";
import NoDataAvailable from "components/NoDataAvailable";

export default withNamespaces()(
  class MigrationBySex extends Section {
    state = {
      chart: true,
      stacked: true
    };

    static need = [
      (params, store) => {
        const country = getLevelObject(params);
        const prm = mondrianClient.cube("immigration").then(cube => {
          const q = levelCut(
            country,
            "Origin Country",
            "Country",
            cube.query
              .option("parents", true)
              .option("sparse", false)
              .drilldown("Date", "Year")
              .drilldown("Sex", "Sex")
              .measure("Number of visas"),
            "Continent",
            "Country",
            store.i18n.locale,
            false
          );

          return {
            key: "path_country_migration_by_sex",
            data: __API__ + q.path("jsonrecords")
          };
        });

        return {
          type: "GET_DATA",
          promise: prm
        };
      }
    ];

    prepareData = data => {
      if (data.data && data.data.length) {
        return data.data.map(item => {
          item["Number of visas"] = item["Number of visas"] || 0;
          return item;
        });
      } else {
        this.setState({ chart: false });
      }
    };

    // to stack, or not to stack
    toggleStacked() {
      this.setState({
        stacked: !this.state.stacked
      });
    }

    render() {
      const { t, className, i18n } = this.props;
      const { stacked } = this.state;

      const path = this.context.data.path_country_migration_by_sex;
      const locale = i18n.language;
      const classSvg = "migration-by-sex";

      // console.log(path); // it's a URL

      return (
        <div className={className}>
          <h3 className="chart-title">
            <span>
              {t("Migration By Sex")}
              <SourceTooltip cube="immigration" />
            </span>
            <ExportLink path={path} className={classSvg} />
          </h3>
          {this.state.chart ? (
            <BarChart
              className={classSvg}
              config={{
                height: 400,
                data: path,
                groupBy: "ID Sex",
                label: d => d["Sex"],
                x: "Year",
                y: "Number of visas",
                stacked: stacked,
                shapeConfig: {
                  fill: d => COLORS_GENDER[d["ID Sex"]]
                },
                xConfig: {
                  title: false
                },
                yConfig: {
                  title: t("Visas"),
                  tickFormat: tick => numeral(tick, locale).format("(0a)")
                },
                barPadding: 0,
                groupPadding: 10,
                tooltipConfig: {
                  title: d => d["Sex"],
                  body: d =>
                    numeral(d["Number of visas"], locale).format("( 0,0 )") +
                    " " +
                    t("visas")
                },
                legendConfig: {
                  label: false,
                  shapeConfig: {
                    backgroundImage: d =>
                      "/images/legend/sex/" + d["ID Sex"] + ".png"
                  }
                }
              }}
              dataFormat={this.prepareData}
            />
          ) : (
            <NoDataAvailable />
          )}
          {/* stacked bar toggle */}
          <Switch
            onClick={this.toggleStacked.bind(this)}
            label={t("Stacked bars")}
            defaultChecked={stacked}
          />
        </div>
      );
    }
  }
);
