export class Union {
  /**
   * A couple and their children
   * @param {string} parent1 First spouse
   * @param {string} [parent2] Second spouse
   * @param {string[]} children The couple's children
   * @param {Date} [dom] Date of marriage
   * @param {string} [pom] City name of place of marriage
   * @param {Date} [dod] Date of divorce
   */
  constructor(parent1, parent2, children, dom, pom, dod) {
    this.parent1 = parent1 ?? null;
    this.parent2 = parent2 ?? null;
    this.children = children ?? [];
    this.dom = dom instanceof Date ? dom : undefined;
    this.pom = pom ?? undefined;
    this.dod = dod instanceof Date ? dod : undefined;
  }

  get parents() {
    return [this.parent1, this.parent2]
      .filter((parent) => parent != null);
  }

  /**
   * Extract a union from its JSON format
   * @param {Object} data Raw JSON data for this identity
   * @returns {Union}
   */
  static fromJSON(data) {
    return new Union(
      data.parent1,
      data.parent2,
      data.children,
      data.dom ? new Date(data.dom.replace("/", "-")) : undefined,
      data.pom,
      data.dod ? new Date(data.dod.replace("/", "-")) : undefined,
    );
  }
}
