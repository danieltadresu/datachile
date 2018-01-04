import React from "react";
import { translate } from "react-i18next";
import { Section } from "datawheel-canon";

import { sources } from "helpers/consts";
import { simpleAvailableGeoDatumNeed } from "helpers/MondrianClient";
import { getGeoObject } from "helpers/dataUtils";
import { numeral, slugifyItem } from "helpers/formatters";

import FeaturedDatum from "components/FeaturedDatum";

class ServicesAccessSlide extends Section {
  static need = [
    (params, store) => {
      const geo = getGeoObject(params);
      const msrName =
        geo.type == "comuna"
          ? "Expansion Factor Comuna"
          : "Expansion Factor Region";
      return simpleAvailableGeoDatumNeed(
        "datum_network_electricity_households",
        "casen_household",
        [msrName],
        {
          drillDowns: [["Electricity", "Electricity", "Electricity"]],
          options: { parents: false },
          cuts: [
            `[Date].[Date].[Year].&[${sources.casen_household.year}]`,
            "{[Electricity].[Electricity].[Electricity].&[1],[Electricity].[Electricity].[Electricity].&[2],[Electricity].[Electricity].[Electricity].&[3]}"
          ]
        }
      )(params, store);
    },
    (params, store) => {
      const geo = getGeoObject(params);
      const msrName =
        geo.type == "comuna"
          ? "Expansion Factor Comuna"
          : "Expansion Factor Region";
      return simpleAvailableGeoDatumNeed(
        "datum_household_total",
        "casen_household",
        [msrName],
        {
          drillDowns: [["Date", "Date", "Year"]],
          options: { parents: false },
          cuts: [`[Date].[Date].[Year].&[${sources.casen_household.year}]`]
        }
      )(params, store);
    }
  ];

  render() {
    const { children, t, i18n } = this.props;
    const locale = i18n.language;

    const {
      datum_network_electricity_households,
      datum_household_total,
      geo
    } = this.context.data;

    const area = datum_network_electricity_households.available
      ? geo
      : geo.ancestors[0];

    const total_network_electricity = datum_network_electricity_households.data.reduce(
      (sum, d) => sum + d,
      0
    );

    const datum = datum_network_electricity_households.available
      ? numeral(
          total_network_electricity / datum_household_total.data,
          locale
        ).format("(0.0%)")
      : t("no_datum");

    const txt_slide = t("geo_profile.housing.amenities.text");

    return (
      <div className="topic-slide-block">
        <div className="topic-slide-intro">
          <div className="topic-slide-title">{t("Services Access")}</div>
          <div
            className="topic-slide-text"
            dangerouslySetInnerHTML={{ __html: txt_slide }}
          />
          <div className="topic-slide-data">
            {datum_network_electricity_households &&
              datum_household_total && (
                <FeaturedDatum
                  className="l-1-3"
                  icon="empleo"
                  datum={datum}
                  title={t("Connected to electricity network")}
                  subtitle={
                    datum_network_electricity_households.available
                      ? numeral(total_network_electricity, locale).format(
                          "(0.0 a)"
                        ) +
                        t(" in ") +
                        area.caption
                      : ""
                  }
                />
              )}
            <FeaturedDatum
              className="l-1-3"
              icon="empleo"
              datum="xx"
              title="Lorem ipsum"
              subtitle="Lorem blabla"
            />
            <FeaturedDatum
              className="l-1-3"
              icon="industria"
              datum="xx"
              title="Lorem ipsum"
              subtitle="Lorem blabla"
            />
          </div>
        </div>
        <div className="topic-slide-charts">{children}</div>
      </div>
    );
  }
}

export default translate()(ServicesAccessSlide);
