

const moment = require("moment");

const db = require("../db");


class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

set numGuests(value) {
  if (value < 1) throw new Error("Must have at least one")
  this.numGuests = value;
}

get numGuests() { 
  return this.numGuests; 
}

 set startAt(value) {
  if (value instanceof Date && !isNaN(value)) this.startAt = value;
  else throw new Error("Can't set startAt")
 }

 get startAt() { return this._startAt; }

 get formattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  set notes(value) {
    this.notes = value || '';
  }

  get notes() { return this.notes; }

set customerId(value) {
  if (this._customerId && value) throw new Error(`Can't change customer ID`);
  this._customerId = value;
}

get customerId() { return this._customerId; }

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

static async get(id) {
  const results = await db.query(
    `SELECT id, customer_id AS "customerId",
    num_guests AS "numGuests
    start_at AS "startAt
    notes
    FROM reservations
    WHERE id = $1`,
    [id]
  );

  let reservation = results.row[0];

    if (reservation === undefined) {
      const err = new Error(`No reservation: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Reservation(reservation);
}

async save() {
  if (this.id === undefined) {
    const result = await db.query(
      `INSERT INTO reservation form (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
    );
    this.id = result.rows[0].id
  } else {
    await db.query(
      `UPDATE reservations SET num_guests = $1, start_at = $2, notes = $3, WHERE id = $4`,
      [this.numGuests, this.startAt, this.notes, this.id]
    );
  }
}
}

module.exports = Reservation;
