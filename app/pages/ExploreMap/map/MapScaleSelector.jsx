import React from "react";
import { withNamespaces } from "react-i18next";
import { connect } from "react-redux";

import "./MapScaleSelector.css";

class MapScaleSelector extends React.Component {
	componentWillReceiveProps(nextProps) {
		const { setMapScale, queryLog } = nextProps;

		if (!queryLog) {
			setMapScale("linear");
		}
	}

	render() {
		const { t, mapScale, setMapScale, queryLinear, queryLog } = this.props;

		if (!queryLinear) {
			return null;
		}

		return (
			<div className="map-scale-options">
				<p className="map-scale-text">{t("Visualize by")}</p>
				<div className="map-scale-options-container">
					<a
						className={`toggle ${mapScale === "log" ? "selected" : ""}`}
						onClick={evt => setMapScale("log")}
					>
						{t("Log")}
					</a>
					<a
						className={`toggle ${mapScale === "linear" ? "selected" : ""}`}
						onClick={evt => setMapScale("linear")}
					>
						{t("Linear")}
					</a>
					<a
						className={`toggle ${mapScale === "decile" ? "selected" : ""}`}
						onClick={evt => setMapScale("decile")}
					>
						{t("Decile")}
					</a>
					<a
						className={`toggle ${mapScale === "jenks" ? "selected" : ""}`}
						onClick={evt => setMapScale("jenks")}
					>
						{t("Jenks")}
					</a>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	setMapScale(payload) {
		dispatch({ type: "MAP_SCALE_SET", payload });
	}
});

const mapStateToProps = (state, ownProps) => {
	return {
		mapScale: state.map.params.scale,
		queryLinear: state.map.results.queries.region,
		queryLog: state.map.results.queries.comuna
	};
};

MapScaleSelector = withNamespaces()(
	connect(mapStateToProps, mapDispatchToProps)(MapScaleSelector)
);

export default MapScaleSelector;
export { MapScaleSelector };
