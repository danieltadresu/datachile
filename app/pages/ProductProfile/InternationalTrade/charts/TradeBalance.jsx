import React from "react";
import { Section } from "@datawheel/canon-core";
import { LinePlot } from "d3plus-react";
import { withNamespaces } from "react-i18next";

import { sources } from "helpers/consts";
import { joinDataByYear } from "helpers/dataUtils";

import { tradeBalanceColorScale } from "helpers/colors";
import { numeral, getNumberFromTotalString } from "helpers/formatters";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";

class TradeBalance extends Section {
	static need = [];

	render() {
		const { t, className, i18n } = this.props;
		const path = this.context.data.path_trade_balance;

		let { datum_exports_by_year, datum_imports_by_year } = this.context.data;
		const locale = i18n.language;

		datum_exports_by_year = joinDataByYear(
			datum_exports_by_year,
			"FOB US",
			sources.exports.min_year,
			sources.exports.year
		);

		datum_imports_by_year = joinDataByYear(
			datum_imports_by_year,
			"CIF US",
			sources.exports.min_year,
			sources.exports.year
		);

		const data = datum_exports_by_year
			? datum_exports_by_year.reduce((all, item, key) => {
					all.push({
						variable: "Exports",
						value: item,
						year: key + sources.exports.min_year
					});
					all.push({
						variable: "Imports",
						value: datum_imports_by_year[key],
						year: key + sources.imports.min_year
					});
					all.push({
						variable: "Trade Balance",
						value: item - datum_imports_by_year[key],
						year: key + sources.imports.min_year
					});

					return all;
			  }, [])
			: [];

		const classSvg = "trade-balance-product";

		return (
			<div className={className}>
				<h3 className="chart-title">
					<span>
						{t("Trade Balance")}
						<SourceTooltip cube="imports" />
					</span>
					<ExportLink path={path} className={classSvg} />
				</h3>
				<LinePlot
					className={classSvg}
					config={{
						height: 400,
						data: data,
						groupBy: "variable",
						x: "year",
						y: "value",
						xConfig: {
							tickSize: 0,
							title: false
						},
						yConfig: {
							title: t("USD"),
							tickFormat: tick => numeral(tick, locale).format("($0.[00]a)")
						},
						legendConfig: {
							label: d => t(d["variable"])
						},
						shapeConfig: {
							Line: {
								stroke: d => tradeBalanceColorScale(d["variable"]),
								strokeWidth: 2
							}
						},
						tooltipConfig: {
							title: d => t(d["variable"]),
							body: d =>
								"<div>" +
								d["year"] +
								": USD " +
								numeral(d["value"], locale).format("($0.00a)") +
								"</div>"
						}
					}}
				/>
			</div>
		);
	}
}

export default withNamespaces()(TradeBalance);
