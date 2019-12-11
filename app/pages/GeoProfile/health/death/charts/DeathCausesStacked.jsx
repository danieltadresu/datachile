import {Section} from "@datawheel/canon-core";
import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";
import {StackedArea} from "d3plus-react";
import {employmentColorScale} from "helpers/colors";
import {numeral} from "helpers/formatters";
import React from "react";
import {withNamespaces} from "react-i18next";

class DeathCausesStacked extends Section {
  static need = [];

  render() {
    const {t, className, i18n} = this.props;

    const path = this.context.data.path_health_death_causes;
    const locale = i18n.language;
    const classSvg = "death-causes-stacked";

    return (
      <div className={className}>
        <h3 className="chart-title">
          <span>
            {t("Death Causes Over Time")}
            <SourceTooltip cube="death_causes" />
          </span>
          <ExportLink path={path} className={classSvg} />
        </h3>

        <StackedArea
          className={classSvg}
          config={{
            height: 400,
            data: path,
            groupBy: ["CIE 10"],
            label: d => d["CIE 10"],
            y: d => d["Casualities Count SUM"],
            x: d => d["Year"],
            shapeConfig: {
              fill: d => employmentColorScale("CIE" + d["ID CIE 10"])
            },
            tooltipConfig: {
              title: d => d["CIE 10"],
              body: d =>
                numeral(d["Casualities Count SUM"], locale).format("0,0") +
                " " +
                t("people")
            },
            xConfig: {
              title: t("Year")
            },
            yConfig: {
              title: t("Number of deaths")
            },
            legend: false
          }}
          dataFormat={data => data.data}
        />
      </div>
    );
  }
}

export default withNamespaces()(DeathCausesStacked);
