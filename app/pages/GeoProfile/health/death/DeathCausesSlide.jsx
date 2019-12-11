import React from "react";
import { withNamespaces } from "react-i18next";
import { Section } from "@datawheel/canon-core";

import { simpleDatumNeed } from "helpers/MondrianClient";
import { sources } from "helpers/consts";
import { numeral } from "helpers/formatters";

import FeaturedDatum from "components/FeaturedDatum";
import LevelWarning from "components/LevelWarning";

import { DeathCauses } from "texts/GeoProfile";

class DeathCausesSlide extends Section {
  static need = [
    (params, store) =>
      simpleDatumNeed(
        "datum_health_death_causes_by_year",
        "death_causes",
        ["Casualities Count SUM"],
        {
          drillDowns: [
            ["CIE 10", "CIE 10", "CIE 10"],
            ["Date", "Date", "Year"]
          ],
          options: { parents: true }
        },
        "geo",
        false
      )(params, store),

    (params, store) =>
      simpleDatumNeed(
        "datum_health_death_causes_tumors",
        "death_causes",
        ["Casualities rate per 100 inhabitants"],
        {
          drillDowns: [
            ["CIE 10", "CIE 10", "CIE 10"],
            ["Date", "Date", "Year"]
          ],
          options: { parents: true },
          cuts: [
            "[CIE 10].[CIE 10].[CIE 10].&[C00-D48]",
            `[Date].[Date].[Year].&[${sources.death_causes.year}]`
          ]
        },
        "geo"
      )(params, store)
  ];

  render() {
    if (!this.context) return null;

    const { children, path, t, i18n } = this.props;
    const {
      datum_health_death_causes_by_year,
      datum_health_death_causes_tumors,
      geo
    } = this.context.data;
    const locale = i18n.language;

    const text = DeathCauses(
      datum_health_death_causes_by_year,
      geo.depth > 1 ? geo.ancestors[0] : geo,
      locale
    );

    return (
      <div className="topic-slide-block">
        <div className="topic-slide-intro">
          <h3 className="topic-slide-title u-visually-hidden">{t("Death Causes")}</h3>
          <div className="topic-slide-text">
            <p
              dangerouslySetInnerHTML={{
                __html: t("geo_profile.health.death_causes", text)
              }}
            />
          </div>
          <div className="topic-slide-data">
            {text && (
              <FeaturedDatum
                className="l-1-2"
                icon="muerte"
                datum={text.data.first.rate}
                title={
                  t("Yearly growth in deaths by ") + text.data.first.caption
                }
                subtitle={text.year.first + "-" + text.year.last}
              />
            )}
            {text && (
              <FeaturedDatum
                className="l-1-2"
                icon="muertes-tumores"
                datum={numeral(
                  datum_health_death_causes_tumors.data,
                  locale
                ).format("0.0")}
                title={t("Tumors (Neoplasms) deaths")}
                subtitle={
                  t("Per 100 inhabitants in") + " " + sources.death_causes.year
                }
              />
            )}
            {/*text && (
              <FeaturedDatum
                className="l-1-3"
                icon="empleo"
                datum="xx"
                title="Lorem ipsum"
                subtitle="Lorem blabla"
              />
            )*/}
          </div>
          {this.context.data.geo.depth > 1 && (
            <LevelWarning name={this.context.data.geo.ancestors[0].caption} path={path} />
          )}
        </div>
        <div className="topic-slide-charts">{children}</div>
      </div>
    );
  }
}

export default withNamespaces()(DeathCausesSlide);
