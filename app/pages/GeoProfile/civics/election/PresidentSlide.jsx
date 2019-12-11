import React from "react";
import { withNamespaces } from "react-i18next";
import { Section } from "@datawheel/canon-core";

import { simpleGeoDatumNeed2 } from "helpers/MondrianClient";
import { sources } from "helpers/consts";

import FeaturedDatum from "components/FeaturedDatum";

import { textCivicsPresident } from "texts/GeoProfile";

const election_year = []
  .concat(sources.election_results_update.presidential_election_year)
  .pop();

class PresidentSlide extends Section {
  static need = [
    simpleGeoDatumNeed2(
      "datum_election_president",
      {
        cube: "election_results_update",
        measures: ["Votes"],
        drillDowns: [
          // ["Party", "Partido"],
          ["Candidates", "Candidate"],
          ["Election Type", "Election Type"]
        ],
        cuts: [
          { key: "[Election Type].[Election Type]", values: [1, 2] },
          `[Date].[Year].&[${election_year}]`
        ],
        options: { sparse: true },
        format: "jsonrecords"
      },
      textCivicsPresident
    )
  ];

  render() {
    const { children, t } = this.props;
    const { geo } = this.context.data;

    const text = this.context.data.datum_election_president;
    if (text) {
      text.geo = geo;
      text.context = geo.depth > 0 ? "" : "country";
    }

    return (
      <div className="topic-slide-block">
        <div className="topic-slide-intro">
          <h3 className="topic-slide-title">
            {t("geo_profile.civics.president.title")}
          </h3>
          <p
            className="topic-slide-text"
            dangerouslySetInnerHTML={{
              __html: t(
                "geo_profile.civics.president.text",
                text || { context: "nodata", geo, year: election_year }
              )
            }}
          />
          <div className="topic-slide-data">
            {text && (
              <FeaturedDatum
                className="l-1-2"
                icon="cambio-votacion"
                datum={text.round1[0].votes}
                title={t("Total votes for {{Candidate}}", text.round1[0])}
                subtitle={t(
                  "Higher amount of votes in {{caption}} - Presidential 1st round",
                  geo
                )}
              />
            )}
            {text && (
              <FeaturedDatum
                className="l-1-2"
                icon="participation"
                datum={text.round2[0].votes}
                title={t("Total votes for {{Candidate}}", text.round2[0])}
                subtitle={t(
                  "Higher amount of votes in {{caption}} - Presidential 2nd round",
                  geo
                )}
              />
            )}
          </div>
        </div>
        <div className="topic-slide-charts">{children}</div>
      </div>
    );
  }
}

export default withNamespaces()(PresidentSlide);
