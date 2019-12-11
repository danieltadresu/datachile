import React, { Component } from "react";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";
import { Link } from "react-router";
import { CSVLink } from "react-csv";
import { slugifyStr } from "helpers/formatters";
import { combineAndFlatDatasets } from "helpers/map";

import PivotSelector from "./PivotSelector";
import DataOptions from "./DataOptions";

import SourceNote from "components/SourceNote";

import "./DataSidebar.css";

class DataSidebar extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { t, datasets = [], deleteDataset, pivotType } = this.props;

		const datasetsQty = datasets.length;

		const data = combineAndFlatDatasets(datasets, pivotType);

		return (
			<div className="data-sidebar">
				<h1>{t("My Data")}</h1>
				{/*<PivotSelector />
				<DataOptions />*/}
				<div className="dataset-list-container">
					{datasets.length == 0 && (
						<span className="dataset-index">{t("No datasets selected")}.</span>
					)}
					{datasets.map((d, ix) => (
						<div className="dataset">
							<span className="dataset-index">
								{ix + 1}. {t("Dataset")}
							</span>
							<div className="dataset-name-action">
								<span className="dataset-name">{d.title}</span>
								<a
									className="dataset-delete"
									onClick={evt => deleteDataset(ix)}
								>
									<img src="/images/icons/icon-close-black.svg" />
								</a>
							</div>
							<SourceNote cube={d.cube} />
						</div>
					))}
				</div>

				{datasets.length > 0 && (
					<CSVLink
						data={data.dataset}
						filename={
							datasets.reduce(
								(title, d) => title + "_" + slugifyStr(d.title),
								"Datachile"
							) + ".csv"
						}
						className="map-csv-btn"
						target="_blank"
					>
						{t("download.csv")}
					</CSVLink>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		datasets: state.map.datasets,
		pivotType: state.map.pivot
	};
};

const mapDispatchToProps = dispatch => ({
	deleteDataset(value) {
		dispatch({
			type: "MAP_DELETE_DATASET",
			index: value
		});
	}
});

DataSidebar = withNamespaces()(
	connect(mapStateToProps, mapDispatchToProps)(DataSidebar)
);

export default DataSidebar;
export { DataSidebar };
