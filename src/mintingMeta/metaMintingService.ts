import axios, {AxiosInstance} from "axios";
import {JSONBI} from "../utils/json";
import {MintingDataRequest, MintingDataResponse} from "./models";

export interface MetaMintingService {

  getTokenData(tokenPreInfo: MintingDataRequest): Promise<MintingDataResponse | undefined>
}

export class SpectrumMetaMintingService implements MetaMintingService {

  readonly backend: AxiosInstance

  constructor(uri: string) {
    this.backend = axios.create({
      baseURL: uri,
      timeout: 15000,
      headers: {"Content-Type": "application/json"}
    })
  }

  getTokenData(tokenPreInfo: MintingDataRequest): Promise<MintingDataResponse | undefined> {
    return this.backend
      .post<MintingDataResponse>("/cardano/minting/data/", tokenPreInfo, {
        transformResponse: data => JSONBI.parse(data)
      })
      .then(res => res.data)
  }
}
