export function createRecordModel(db) {
  const list = (resource) =>
    db
      .prepare("SELECT * FROM records WHERE resource=?")
      .all(resource)
      .map((row) => ({
        ...JSON.parse(row.data),
        id: row.id,
        _version: row.version,
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  const get = (resource, id) =>
    list(resource).find((item) => String(item.id) === String(id));
  const audit = (actor, action, resource, id) =>
    db
      .prepare(
        "INSERT INTO audit(actor,action,resource,record_id,created) VALUES(?,?,?,?,?)",
      )
      .run(actor, action, resource, String(id), new Date().toISOString());
  const insert = (resource, item) =>
    db
      .prepare("INSERT INTO records(resource,id,data) VALUES(?,?,?)")
      .run(resource, String(item.id), JSON.stringify(item));

return {list,get,audit,insert};
}
