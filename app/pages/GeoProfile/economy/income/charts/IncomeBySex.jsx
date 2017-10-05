import React, { Component } from "react";
import { BarChart } from "d3plus-react";
import { translate } from "react-i18next";
import { Section } from "datawheel-canon";

import { numeral, moneyRangeFormat } from "helpers/formatters";
import mondrianClient, { geoCut } from "helpers/MondrianClient";
import { getGeoObject } from "helpers/dataUtils";
import { COLORS_GENDER } from "helpers/colors";


class IncomeBySex extends Section {
  static need = [
    (params, store) => {
      
      var geo = getGeoObject(params);
      const prm = mondrianClient.cube("nesi_income").then(cube => {
        var q = geoCut(
          geo,
          "Geography",
          cube.query
            .option("parents", true)
            .drilldown("Date", "Date", "Year")
            .drilldown("Income Range", "Income Range", "Income Range")
            .drilldown("Sex", "Sex", "Sex")
            .measure("Expansion Factor"),
          store.i18n.locale
        );

        return {
          key: "path_income_by_sex",
          data: store.env.CANON_API + q.path("jsonrecords")
        };
      });

      return {
        type: "GET_DATA",
        promise: prm
      };
    }
  ];

  render() {
    const path = this.context.data.path_income_by_sex;
    const { t, className, i18n } = this.props;
    const locale = i18n.language.split("-")[0];

    return (
      <div className={className}>
        <h3 className="chart-title">
          {t("Income By Sex")}
        </h3>
        <BarChart
            config={{
              height: 500,
              data: path,
              groupBy: "ID Sex",
              label: d =>
                d['Sex'],
              time: "ID Year",
              x: "Income Range",
              y: "Expansion Factor",
              shapeConfig: {
                  fill: d => COLORS_GENDER[d["ID Sex"]],
                  label: false
              },
              xConfig:{
                tickSize:0,
                title:t("Income Range CLP"),
                tickFormat:(tick) => moneyRangeFormat(tick,locale)
              },
              xSort:(a,b) => a['ID Income Range']>b['ID Income Range'] ? 1:-1,
              yConfig:{
                title:t("People"),
                tickFormat:(tick) => numeral(tick, locale).format("(0 a)")
              },
              barPadding: 0,
              groupPadding: 5,
              tooltipConfig:{
                title: d => {
                  var title = d["Sex"];
                  title += (d["Income Range"] instanceof Array)?'':': ' + moneyRangeFormat(d["Income Range"],locale);
                  return title;
                },
                body: d => numeral(d['Expansion Factor'], locale).format("(0 a)") + " " + t("people")
              },
              legendConfig: {
                  label: false,
                  shapeConfig:{
                      width:40,
                      height:40,
                      backgroundImage: d => "/images/legend/sex/"+d["ID Sex"]+".png",
                  }
              }
            }}
            
            dataFormat={data => data.data}
          />
      </div>
    );
  }
}

export default translate()(IncomeBySex);
