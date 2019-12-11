import React from "react";
import { withNamespaces } from "react-i18next";
import { Geomap } from "d3plus-react";
import NoDataAvailable from "components/NoDataAvailable";
import { geoProjection } from "d3-geo";
import { geoMillerRaw } from "d3-geo-projection";

import { COLORS_SCALE_EXPORTS, COLORS_SCALE_IMPORTS } from "helpers/colors";
import styles from "style.yml";

import {
  numeral,
  slugifyItem,
  getNumberFromTotalString
} from "helpers/formatters";

import "./CustomMap.css";

class CustomMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true
    };
  }

  render() {
    const { t, path, msrName, className, locale, router } = this.props;
    // console.log(geoMillerRaw);

    return this.state.show ? (
      <div className="geomap">
        <Geomap
          config={{
            height: 400,
            padding: 3,
            projection: geoProjection(geoMillerRaw),
            data: path,
            tiles: false,
            fitObject: "/geo/countries.json",
            topojson: "/geo/countries.json",

            fitFilter: d => {
              return "ATA".indexOf(d.id) < 0;
            },
            //fitFilter: d => "ATA",
            fitKey: "id",
            groupBy: "iso3",
            label: d => d["Country"],
            ocean: styles["near-black"],
            topojsonId: "id",
            topojsonKey: "id",
            total: d => d[msrName],
            totalConfig: {
              text: d =>
                "Total: US " +
                numeral(getNumberFromTotalString(d.text), locale).format(
                  "($0,.[00]a)"
                )
            },
            on: {
              click: d => {
                if (!(d["ID Country"] instanceof Array)) {
                  var url = slugifyItem(
                    "countries",
                    d["ID Continent"],
                    d["Continent"],
                    d["ID Country"] instanceof Array ? false : d["ID Country"],
                    d["Country"] instanceof Array ? false : d["Country"]
                  );
                  router.push(url);
                }
              }
            },
            tooltipConfig: {
              title: d => {
                return d["Country"];
              },
              body: d => {
                const link =
                  d["ID Country"] instanceof Array
                    ? ""
                    : "<br/><a>" + t("tooltip.view_profile") + "</a>";
                return numeral(d[msrName], locale).format("(USD 0a)") + link;
              }
            },

            sum: d => d.variable,

            colorScale: "variable",
            colorScalePosition: "bottom",
            colorScaleConfig: {
              color:
                className === "exports"
                  ? COLORS_SCALE_EXPORTS
                  : className === "imports"
                    ? COLORS_SCALE_IMPORTS
                    : ["#CFE4F1", "#9FCAE3", "#6EAFD5", "#3C94C7"],
              axisConfig: {
                shapeConfig: {
                  labelConfig: {
                    fontColor: "#FFF"
                  }
                },
                tickFormat: tick => {
                  return numeral(parseFloat(tick), "es").format("($0.[00]a)");
                }
              },
              select: `.geo-${className}`,
              align: "start",
              scale: "jenks"
            }
          }}
          dataFormat={data => {
            if (data.data) {
              return data.data.map(item => {
                return { ...item, variable: item[msrName] };
              });
            } else {
              this.setState({ show: false });
            }
          }}
        />
        {<svg id={"legend"} className={`geo-${className}`} />}
      </div>
    ) : (
      <NoDataAvailable />
    );
  }
}

export default withNamespaces()(CustomMap);
