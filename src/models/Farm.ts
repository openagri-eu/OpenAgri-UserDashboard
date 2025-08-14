export interface FarmModel {
    '@type': string;
    '@id': string;
    status: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    name: string;
    description: string;
    administrator: string;
    telephone: string;
    vatID: string;
    hasAgriParcel: Array<{
      '@type': string;
      '@id': string;
    }>;
    contactPerson: {
      firstname: string;
      lastname: string;
      '@id': string;
      '@type': string;
    };
    address: {
      '@id': string;
      '@type': string;
      adminUnitL1: string;
      adminUnitL2: string;
      addressArea: string;
      municipality: string;
      community: string;
      locatorName: string;
    };
  }