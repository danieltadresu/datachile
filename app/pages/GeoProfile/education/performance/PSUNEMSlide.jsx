import React from "react";
import { withNamespaces } from "react-i18next";
import { Section } from "@datawheel/canon-core";
import { simpleDatumNeed } from "helpers/MondrianClient";
import { getGeoObject } from "helpers/dataUtils";

import FeaturedDatum from "components/FeaturedDatum";
import { numeral } from "helpers/formatters";
import { sources } from "helpers/consts";
import {
  PerformanceByPSU,
  PerformanceByPSUComuna,
  PerformanceByHighSchool
} from "texts/GeoProfile";

import merge from "lodash/merge";

class PSUNEMSlide extends Section {
  static need = [
    (params, store) => {
      let geo = getGeoObject(params);

      if (geo.type === "comuna") {
        return simpleDatumNeed(
          "datum_performance_by_highschool",
          "education_performance_new",
          ["Average PSU"],
          {
            drillDowns: [["Institution", "Institution", "Institution"]],
            options: { parents: true },
            cuts: [
              `[Year].[Year].[Year].&[${
                sources.education_performance_new.year
              }]`
            ]
          },
          "geo",
          false
        )(params, store);
      } else {
        return simpleDatumNeed(
          "datum_performance_by_psu_comuna",
          "education_performance_new",
          ["Average PSU"],
          {
            drillDowns: [["Geography", "Geography", "Comuna"]],
            options: { parents: true },
            cuts: [
              `[Year].[Year].[Year].&[${
                sources.education_performance_new.year
              }]`
            ]
          },
          "geo",
          false
        )(params, store);
      }
    },
    (params, store) =>
      simpleDatumNeed(
        "datum_performance_by_psu",
        "education_performance_new",
        ["Average PSU"],
        {
          drillDowns: [["Institution", "Institution", "Administration"]],
          options: { parents: true },
          cuts: [
            `[Year].[Year].[Year].&[${sources.education_performance_new.year}]`
          ]
        },
        "geo",
        false
      )(params, store),
    (params, store) =>
      simpleDatumNeed(
        "datum_performance_psu_average",
        "education_performance_new",
        ["Average PSU"],
        {
          drillDowns: [["Year", "Year", "Year"]],
          options: { parents: true },
          cuts: [
            `[Year].[Year].[Year].&[${sources.education_performance_new.year}]`
          ]
        },
        "geo"
      )(params, store),
    (params, store) =>
      simpleDatumNeed(
        "datum_performance_nem_average",
        "education_performance_new",
        ["Average NEM"],
        {
          drillDowns: [["Year", "Year", "Year"]],
          options: { parents: true },
          cuts: [
            `[Year].[Year].[Year].&[${sources.education_performance_new.year}]`
          ]
        },
        "geo"
      )(params, store),
    (params, store) =>
      simpleDatumNeed(
        "datum_performance_total",
        "education_performance_new",
        ["Number of records"],
        {
          drillDowns: [["Year", "Year", "Year"]],
          options: { parents: true },
          cuts: [
            `[Year].[Year].[Year].&[${sources.education_performance_new.year}]`
          ]
        },
        "geo"
      )(params, store)
  ];

  render() {
    if (!this.context) return null;

    const { children, t, i18n } = this.props;
    let {
      geo,
      datum_performance_by_psu,
      datum_performance_by_psu_comuna,
      datum_performance_by_highschool,
      datum_performance_nem_average,
      datum_performance_psu_average,
      datum_performance_total
    } = this.context.data;

    const locale = i18n.language;

    const perf = PerformanceByPSU(datum_performance_by_psu, geo, locale, t);

    const rank = datum_performance_by_psu_comuna
      ? PerformanceByPSUComuna(datum_performance_by_psu_comuna, locale)
      : PerformanceByHighSchool(datum_performance_by_highschool, locale, t);

    let gap = undefined;
    const check = datum_performance_by_psu && datum_performance_by_psu.data;

    if (geo.type === "country" && check) {
      gap =
        datum_performance_by_psu.data.find(d => d["ID Administration"] === 3)["Average PSU"] -
        datum_performance_by_psu.data.find(d => d["ID Administration"] === 1)["Average PSU"];
    }

    const text = merge(perf, rank);

    return (
      <div className="topic-slide-block">
        <div className="topic-slide-intro">
          <h3 className="topic-slide-title u-visually-hidden">
            {t("Performance")}
          </h3>
          <div className="topic-slide-text">
            {text && text.location && (
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    geo.depth === 2
                      ? t(
                          `geo_profile.education.performance.byPSU.level2.${
                            text.type
                          }`,
                          text
                        )
                      : t(
                          `geo_profile.education.performance.byPSU.level1.${
                            text.location.n_comunas
                          }`,
                          text
                        )
                }}
              />
            )}
          </div>
          <div className="topic-slide-data">
            {text && (
              <FeaturedDatum
                className="l-1-3"
                icon="estudiantes-cantidad"
                datum={numeral(datum_performance_total.data, locale).format(
                  "0,0"
                )}
                title={t("Students that took the PSU")}
                subtitle={
                  t("In") + " " + sources.education_performance_new.year
                }
              />
            )}
            {text &&
              (datum_performance_nem_average.data > 0 && (
                <FeaturedDatum
                  className="l-1-3"
                  icon="promedio-nem"
                  datum={numeral(
                    datum_performance_nem_average.data,
                    locale
                  ).format("0.00")}
                  title={t("Average NEM")}
                  subtitle={
                    t("In") + " " + sources.education_performance_new.year
                  }
                />
              ))}

            {text &&
              (datum_performance_psu_average.data > 0 && !gap ? (
                <FeaturedDatum
                  className="l-1-3"
                  icon="promedio-psu"
                  datum={numeral(
                    datum_performance_psu_average.data,
                    locale
                  ).format("0.00")}
                  title={t("Average PSU")}
                  subtitle={
                    t("In") + " " + sources.education_performance_new.year
                  }
                />
              ) : (
                <FeaturedDatum
                  className="l-1-3"
                  icon="estudiantes-cantidad"
                  datum={numeral(gap, locale).format("0.00")}
                  title={t("GAP between Private/Municipal")}
                  subtitle={
                    t("In") + " " + sources.education_performance_new.year
                  }
                />
              ))}
          </div>

          <h4 className="topic-slide-context-subhead">
            {t("About the PSU average")}
          </h4>
          <p className="font-xxs">
            {t(`geo_profile.education.performance.byPSU.disclaimer`)}
          </p>
        </div>
        <div className="topic-slide-charts">{children}</div>
      </div>
    );
  }
}

export default withNamespaces()(PSUNEMSlide);
