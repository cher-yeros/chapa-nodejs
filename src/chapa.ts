import axios from 'axios';
import { customAlphabet } from 'nanoid/async';
import { alphanumeric } from 'nanoid-dictionary';
import {
  ChapaUrls,
  INITIALIZE_DIRECT_CHARGE,
  AUTHERIZE_DIRECT_CHARGE,
} from './enums';
import { HttpException } from './http-exception';
import {
  ChapaOptions,
  CreateSubaccountOptions,
  CreateSubaccountResponse,
  DirectChargeBody,
  DirectChargeResponse,
  GenerateTransactionReferenceOptions,
  GetBanksResponse,
  InitializeOptions,
  InitializeResponse,
  VerifyOptions,
  VerifyResponse,
  DirectChargePaymentMethod,
  VerifyDirectChargeParams,
  VerifyDirectChargeResponse,
} from './interfaces';
import {
  validateCreateSubaccountOptions,
  validateInitializeOptions,
  validateVerifyOptions,
  validateDirectChargeInitializeOptions,
  validateDirectChargeVerifyOptions,
} from './validations';

interface IChapa {
  initialize(initializeOptions: InitializeOptions): Promise<InitializeResponse>;
  mobileInitialize(
    initializeOptions: InitializeOptions
  ): Promise<InitializeResponse>;
  verify(VerifyOptions: VerifyOptions): Promise<VerifyResponse>;
  generateTransactionReference(
    generateTransactionReferenceOptions?: GenerateTransactionReferenceOptions
  ): Promise<string>;
  getBanks(): Promise<GetBanksResponse>;
  createSubaccount(
    createSubaccountOptions: CreateSubaccountOptions
  ): Promise<CreateSubaccountResponse>;
}
export class Chapa implements IChapa {
  constructor(private chapaOptions: ChapaOptions) {}

  async initialize(
    initializeOptions: InitializeOptions
  ): Promise<InitializeResponse> {
    try {
      await validateInitializeOptions(initializeOptions);

      const response = await axios.post<InitializeResponse>(
        ChapaUrls.INITIALIZE,
        initializeOptions,
        {
          headers: {
            Authorization: `Bearer ${this.chapaOptions.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else if (error.name === 'ValidationError') {
        throw new HttpException(error.errors[0], 400);
      } else {
        throw error;
      }
    }
  }

  async mobileInitialize(
    initializeOptions: InitializeOptions
  ): Promise<InitializeResponse> {
    try {
      await validateInitializeOptions(initializeOptions);

      const response = await axios.post<InitializeResponse>(
        ChapaUrls.MOBILE_INITIALIZE,
        initializeOptions,
        {
          headers: {
            Authorization: `Bearer ${this.chapaOptions.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else if (error.name === 'ValidationError') {
        throw new HttpException(error.errors[0], 400);
      } else {
        throw error;
      }
    }
  }

  async verify(verifyOptions: VerifyOptions): Promise<VerifyResponse> {
    try {
      await validateVerifyOptions(verifyOptions);
      const response = await axios.get<VerifyResponse>(
        `${ChapaUrls.VERIFY}/${verifyOptions.tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${this.chapaOptions.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else if (error.name === 'ValidationError') {
        throw new HttpException(error.errors[0], 400);
      } else {
        throw error;
      }
    }
  }

  async generateTransactionReference(
    generateTransactionReferenceOptions?: GenerateTransactionReferenceOptions
  ): Promise<string> {
    const prefix =
      generateTransactionReferenceOptions &&
      generateTransactionReferenceOptions.prefix
        ? generateTransactionReferenceOptions.prefix
        : 'TX';
    const size =
      generateTransactionReferenceOptions &&
      generateTransactionReferenceOptions.size
        ? generateTransactionReferenceOptions.size
        : 15;
    const nanoid = customAlphabet(alphanumeric, size);
    const reference = await nanoid();
    return `${prefix}-${reference.toUpperCase()}`;
  }

  async getBanks(): Promise<GetBanksResponse> {
    try {
      const banks = await axios.get<GetBanksResponse>(ChapaUrls.BANKS, {
        headers: {
          Authorization: `Bearer ${this.chapaOptions.secretKey}`,
        },
      });
      return banks.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else {
        throw error;
      }
    }
  }

  async createSubaccount(
    createSubaccountOptions: CreateSubaccountOptions
  ): Promise<CreateSubaccountResponse> {
    try {
      await validateCreateSubaccountOptions(createSubaccountOptions);
      const response = await axios.post<CreateSubaccountResponse>(
        ChapaUrls.SUBACCOUNT,
        createSubaccountOptions,
        {
          headers: {
            Authorization: `Bearer ${this.chapaOptions.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else if (error.name === 'ValidationError') {
        throw new HttpException(error.errors[0], 400);
      } else {
        throw error;
      }
    }
  }

  async directChargeInitialize(
    initializeOptions: DirectChargeBody,
    { type }: DirectChargePaymentMethod
  ): Promise<DirectChargeResponse> {
    try {
      await validateDirectChargeInitializeOptions(initializeOptions);

      const response = await axios.post<DirectChargeResponse>(
        INITIALIZE_DIRECT_CHARGE({ type }),
        initializeOptions,
        {
          headers: {
            Authorization: `Bearer ${this.chapaOptions.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else if (error.name === 'ValidationError') {
        throw new HttpException(error.errors[0], 400);
      } else {
        throw error;
      }
    }
  }

  async autherizeDirectChargePayment(
    options: VerifyDirectChargeParams
  ): Promise<VerifyDirectChargeResponse> {
    try {
      await validateDirectChargeVerifyOptions(options);

      const response = await axios.post<VerifyDirectChargeResponse>(
        AUTHERIZE_DIRECT_CHARGE(options.payment_method),
        {
          reference: options.reference,
          client: encrypt(options.encryptionKey, options.payload),
        },
        {
          headers: {
            Authorization: `Bearer ${this.chapaOptions.secretKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message,
          error.response.status
        );
      } else if (error.name === 'ValidationError') {
        throw new HttpException(error.errors[0], 400);
      } else {
        throw error;
      }
    }
  }
}

function encrypt(encryptionKey: string, payload: any) {
  const text = JSON.stringify(payload);
  const forge = require('node-forge');
  const cipher = forge.cipher.createCipher(
    '3DES-ECB',
    forge.util.createBuffer(encryptionKey)
  );
  cipher.start({ iv: '' });
  cipher.update(forge.util.createBuffer(text, 'utf-8'));
  cipher.finish();
  const encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes());
}
