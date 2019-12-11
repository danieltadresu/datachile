import React from "react";
import { Section } from "@datawheel/canon-core";
import { Treemap } from "d3plus-react";
import { withNamespaces } from "react-i18next";

import mondrianClient, { geoCut } from "helpers/MondrianClient";
import { getGeoObject } from "helpers/dataUtils";
import { institutionsColorScale } from "helpers/colors";
import { numeral } from "helpers/formatters";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";
import TreemapStacked from "components/TreemapStacked";

class CollegeByEnrollment extends Section {
  static need = [
    (params, store) => {
      const geo = getGeoObject(params);
      const prm = mondrianClient.cube("education_enrollment").then(cube => {
        var query = cube.query
          .option("parents", true)
          .drilldown("Date", "Date", "Year")
          .measure("Number of records");

        if (geo.type == "comuna") {
          query.drilldown("Institutions", "Institution", "Institution");
        } else {
          query.drilldown("Administration", "Administration", "Administration");
        }

        var q = geoCut(geo, "Geography", query, store.i18n.locale);

        return {
          key: "path_college_by_enrollment",
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
    // const path = this.context.data.path_college_by_enrollment;
    const { t, className, i18n } = this.props;
    const { geo } = this.context.data;

    const locale = i18n.language;
    const classSvg = "college-by-enrollment";

    let path =
      geo.type == "comuna"
        ? `/api/data?measures=Number of records&drilldowns=Institution&Comuna=${
            geo.key
          }&parents=true`
        : geo.type == "region"
        ? `/api/data?measures=Number of records&drilldowns=Administration&Region=${
            geo.key
          }&parents=true`
        : `/api/data?measures=Number of records&drilldowns=Administration&parents=true`;

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("School By Enrollment")}
            <SourceTooltip cube="education_enrollment" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>
        <TreemapStacked
          path={path}
          className={classSvg}
          msrName="Number of records"
          drilldowns={
            geo.type !== "comuna"
              ? ["Administration"]
              : ["Administration", "Institution"]
          }
          defaultChart={"treemap"}
          config={{
            label: d =>
              geo.type !== "comuna" ? d["Administration"] : d["Institution"],
            total: d => d["Number of records"],
            totalConfig: {
              text: d => d.text + " " + t("Students")
            },
            shapeConfig: {
              fill: d => institutionsColorScale(d["ID Administration"])
            },
            tooltipConfig: {
              title: d =>
                d["Institution"] instanceof Array || geo.type != "comuna"
                  ? d["Administration"]
                  : d["Institution"],
              body: d =>
                numeral(d["Number of records"], locale).format("(0,0)") +
                " " +
                t("Students")
            },
            legendConfig: {
              label: "",
              shapeConfig: {
                backgroundImage: () =>
                  "/images/legend/college/administration.png"
              }
            }
          }}
          dataFormat={data => data.data}
        />
      </div>
    );
  }
}

export default withNamespaces()(CollegeByEnrollment);
