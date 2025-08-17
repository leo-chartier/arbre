class Identity {
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
   */
  constructor(id, gender, lastname, firstnames, dob, pob, dod, pod) {
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
  }

  /**
   * Extract an identity from the main file.
   * @param {string} id Unique identifier of this person
   * @returns {Identity}
   */
  static fromId(id) {
    const data = IDENTITIES[id];
    if (!data) throw new Error(`Identity not found with id "${id}"`);

    return new Identity(
      id,
      Object.values(Gender).find(g => g === data.gender) ?? Gender.UNKNOWN,
      data.lastname,
      data.firstnames,
      data.dob ? new Date(data.dob.replace("/", "-")) : undefined,
      data.pob,
      data.dod ? new Date(data.dod.replace("/", "-")) : undefined,
      data.pod,
    );
  }
}
