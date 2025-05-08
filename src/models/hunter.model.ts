import { Document, Schema, model } from "mongoose";
import validator from "validator";

/**
 * Represents a Hunter.
 * @interface HunterInterface
 * @property {string} name - Hunter name.
 * @property {string} race - Hunter race.
 * @property {string} location - Hunter location.
 * @extends Document (Mongoose)
 */
export interface HunterInterface extends Document {
  name: string;
  race:
    | "Human"
    | "Elf"
    | "Dwarf"
    | "Orc"
    | "Sorcerer"
    | "Mage"
    | "Warrior"
    | "Hunter"
    | "Barbarian"
    | "Cleric"
    | "Assassin"
    | "Uknown";
  location: string;
}

/**
 * This function validates the name and location of the Hunter.
 * @param value - The value to validate.
 * @throws {Error} If the value does not meet the validation criteria.
 * - Must start with an uppercase letter.
 * - Must only contain letters and spaces.
 * - Must be between 2 and 30 characters long.
 */
const validation = (value: string) => {
  const upperCase = /^[A-ZÁÉÍÓÚÑ]/
  if (!upperCase.exec(value)) {
    throw new Error("Client name and location must start with an uppercase letter.");
  } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
    throw new Error("Client name and location must only contain letters and spaces.");
  } else if (!validator.isLength(value, { min: 2, max: 30 })) {
    throw new Error("Client name and location must be between 2 and 30 characters long.");
  }
};

/**
 * Hunter schema definition.
 * @type {Schema}
 * @property {String} name - Hunter name.
 * @property {String} race - Hunter race.
 * @property {String} location - Hunter location.
 */
const HunterSchema = new Schema<HunterInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: validation,
  },
  race: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Human",
      "Elf",
      "Dwarf",
      "Orc",
      "Sorcerer",
      "Mage",
      "Warrior",
      "Hunter",
      "Barbarian",
      "Cleric",
      "Assassin",
      "Uknown"
    ],
  },
  location: {
    type: String,
    required: true,
    trim: true,
    validate: validation,
  }
});

export const Hunter = model<HunterInterface>("Hunter", HunterSchema);
