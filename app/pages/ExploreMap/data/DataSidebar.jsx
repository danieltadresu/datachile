import React, { Component } from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { Link } from "react-router";
import { CSVLink } from "react-csv";
import { slugifyStr } from "helpers/formatters";

import { combineAndFlatDatasets } from "helpers/map";

import "./DataSidebar.css";

class DataSidebar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { t, datasets = [], deleteDataset } = this.props;

    const datasetsQty = datasets.length;

    const data = combineAndFlatDatasets(datasets);

    return (
      <div className="data-sidebar">
        <h1>{t("My Data")}</h1>
        <Link to="/explore/map">Go to mapa</Link>
        <div className="dataset-list-container">
          <h2>Datasets {datasetsQty > 0 && <span> ({datasetsQty})</span>}</h2>
          {datasets.map((d, ix) => (
            <div className="dataset">
              <span className="dataset-index">{ix + 1}. </span>
              <span className="dataset-name">
                {d.title} - {d.level}
              </span>
              <a className="dataset-delete" onClick={evt => deleteDataset(ix)}>
                X
              </a>
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
            className="btn btn-primary"
            target="_blank"
          >
            Download CSV
          </CSVLink>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    datasets: state.map.datasets
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

DataSidebar = translate()(
  connect(mapStateToProps, mapDispatchToProps)(DataSidebar)
);

export default DataSidebar;
export { DataSidebar };
