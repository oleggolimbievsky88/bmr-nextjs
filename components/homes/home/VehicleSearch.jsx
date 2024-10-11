
export default function VehicleSearch() {
  return (
    <section className="search__filter--section mt_8">
      <div className="container">
        <div className="text-center mb-30">
          <h4 className="title fw-5">Search by Vehicle</h4>
          <p className="section__heading--desc">
            Filter your results by entering your Vehicle to ensure you find the
            parts that fit.
          </p>
        </div>
        <div className="search__filter--inner style5">
          <form className="search__filter--form__style2 d-flex" action="#">
            <div className="search__filter--select select search__filter--width">
              <select className="search__filter--select__field">
                <option defaultValue="" value="{1}">
                  Choose Year
                </option>
                <option value="{2}">2020 </option>
                <option value="{3}">2022 </option>
                <option value="{4}">2024</option>
                <option value="{5}">2026 </option>
              </select>
            </div>
            <div className="search__filter--select select search__filter--width">
              <select className="search__filter--select__field">
                <option defaultValue="" value="{1}">
                  Select Make
                </option>
                <option value="{2}">Ford </option>
                <option value="{3}">Dodge </option>
                <option value="{4}">Chevy</option>
              </select>
            </div>
            <div className="search__filter--select select search__filter--width">
              <select className="search__filter--select__field">
                <option defaultValue="" value="{1}">
                  Select Model
                </option>
                <option value="{2}">Mustang</option>
                <option value="{3}">Camaro</option>
                <option value="{4}">Firebird</option>
              </select>
            </div>
            <div className="search__filter--select select search__filter--width">
              <select className="search__filter--select__field">
                <option defaultValue="" value={1}>
                  Select Sub Model
                </option>
                <option value={2}>Base</option>
                <option value={3}>GT</option>
                <option value={4}>SS</option>
              </select>
            </div>
            <div className="search__filter--width">
              <button className="search__filter--btn primary__btn" type="submit">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
