import React from "react";
import { Section } from "@datawheel/canon-core";
import { withNamespaces } from "react-i18next";
import { BarChart } from "d3plus-react";

import mondrianClient, { levelCut } from "helpers/MondrianClient";
import { getLevelObject } from "helpers/dataUtils";
import { ordinalColorScale } from "helpers/colors";
import { numeral } from "helpers/formatters";

import ExportLink from "components/ExportLink";
import SourceTooltip from "components/SourceTooltip";
import NoDataAvailable from "components/NoDataAvailable";

export default withNamespaces()(
	class MigrationBySex extends Section {
		state = {
			chart: true
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
							.drilldown("Date", "Year")
							.drilldown("Calculated Age Range", "Age Range")
							.measure("Number of visas"),
						"Continent",
						"Country",
						store.i18n.locale,
						false
					);

					return {
						key: "path_country_migration_by_age",
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
				return data.data;
			} else {
				this.setState({ chart: false });
			}
		};

		render() {
			const { t, className, i18n } = this.props;

			const locale = i18n.language;

			const path = this.context.data.path_country_migration_by_age;
			const classSvg = "migration-by-age";

			return (
				<div className={className}>
					<h3 className="chart-title">
						<span>
							{t("Migration By Calculated Age Range")}
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
								groupBy: "ID Age Range",
								label: d => d["Calculated Age Range"],
								time: "ID Year",
								x: "Age Range",
								y: "Number of visas",
								shapeConfig: {
									fill: () => ordinalColorScale(2)
								},
								xConfig: {
									tickSize: 0,
									title: false
								},
								yConfig: {
									title: t("Visas"),
									tickFormat: tick => numeral(tick, locale).format("(0a)")
								},
								barPadding: 20,
								groupPadding: 10,
								tooltipConfig: {
									title: d => d["Calculated Age Range"],
									body: d =>
										numeral(d["Number of visas"], locale).format("( 0,0 )") +
										" " +
										t("visas")
								},
								legendConfig: {
									label: false,
									shapeConfig: false
								}
							}}
							dataFormat={this.prepareData}
						/>
					) : (
						<NoDataAvailable />
					)}
				</div>
			);
		}
	}
);
