import { Gender, isNonEmptyString } from "./types.js";

export class Identity {
  /**
   * Information about a person
   * @param {string} id Unique identifier of this person
   * @param {Gender} gender The gender
   * @param {string} lastname The lastname at birth
   * @param {string} firstnames The first and middle names
   * @param {Date} [dob] Date of birth
   * @param {string} [pob] City name of place of birth
   * @param {Date} [dod] Date of death
   * @param {string} [pod] City name of place of death
   * @param {string} [picture] URL of this person's picture
   */
  constructor(id, gender, lastname, firstnames, dob, pob, dod, pod, picture) {
    if (!isNonEmptyString(id)) {
      throw new Error(`Invalid id for identity: "${id}"`);
    }

    this.id = id;
    this.gender = gender ?? Gender.UNKNOWN;
    this.lastname = lastname ?? "";
    this.firstnames = firstnames ?? "";
    this.dob = dob instanceof Date ? dob : undefined;
    this.pob = pob ?? undefined;
    this.dod = dod instanceof Date ? dod : undefined;
    this.pod = pod ?? undefined;
    this.picture = picture ?? undefined;
  }

  /**
   * Extract an identity from its JSON format
   * @param {Object} data Raw JSON data for this identity
   * @returns {Identity}
   */
  static fromJSON(data) {
    return new Identity(
      data.id,
      Object.values(Gender).find(g => g === data.gender) ?? Gender.UNKNOWN,
      data.lastname,
      data.firstnames,
      data.dob ? new Date(data.dob.replace("/", "-")) : undefined,
      data.pob,
      data.dod ? new Date(data.dod.replace("/", "-")) : undefined,
      data.pod,
      data.picture,
    );
  }
}
