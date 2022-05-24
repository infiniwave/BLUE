// Thank you ComputerGeek12 for aid in this class

class LiveCollection {
  values = [];
  constructor(schema) {
    this.schema = schema;
  }

  async init() {
    const docs = await this.schema.find();
    this.values = docs;
  }

  get(query) {
    const obj = this.values.find((value) =>
      Object.keys(value)
        .map((k) => query[k] === value[k])
        .every((v) => v)
    );

    return obj;
  }

  getAll() {
    return this.values;
  }

  async set(value) {
    const document = new this.schema(value);
    this.values.push(document);

    console.log(document);

    document.save();

    return document;
  }
  async update(filter, update, cb) {
    const query = this.schema
      .findOneAndUpdate(filter, update)
      .exec()
      .catch((err) => {
        console.error(err);
      });

    cb(this.values);
  }

  async delete(filter, cb) {
    const query = this.schema
      .findOneAndDelete(filter)
      .exec()
      .catch((err) => {
        console.error(err);
      });

    cb(this.values);
  }
}

module.exports = LiveCollection;
