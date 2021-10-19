import { decodeMetadata, decodeEdition, decodeEditionMarker, decodeMasterEdition } from './utils'
import { PublicKey, Connection } from '@solana/web3.js'
// @ts-ignore
import axios from 'axios'


const CONNECTION = "https://api.mainnet-beta.solana.com"



const METADATA_PUBKEY = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const params_data = param => {
	return {
		"jsonrpc": "2.0",
		"id": 1,
		"method": "getAccountInfo",
		"params": [
			param.toBase58(),
			{
				"encoding": "base64"
			}
		]
	}
}

async function getNft(mint_address: PublicKey, ) {
	try {
		let [metadata_pda] = await PublicKey.findProgramAddress([
			Buffer.from("metadata"),
			METADATA_PUBKEY.toBuffer(),
			new PublicKey(mint_address).toBuffer(),
		], METADATA_PUBKEY)

		const [edition_pda] = await PublicKey.findProgramAddress([
			Buffer.from("metadata"),
			METADATA_PUBKEY.toBuffer(),
			new PublicKey(mint_address).toBuffer(),
			Buffer.from("edition")
		], METADATA_PUBKEY)

		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		}
		const rawEditionData: any = await axios.post(CONNECTION, params_data(edition_pda), config)
		if(rawEditionData.data.result.value === null){
			throw new Error("No Account Exists for Address")
		}
		const edition = decodeEdition(Buffer.from(rawEditionData.data.result.value.data[0], 'base64'))
		console.log(edition)
		
		const rawMetaData: any = await axios.post(CONNECTION, params_data(metadata_pda), config)
		if(rawMetaData.data.result.value == null){
			throw new Error("No Account Exists for Address")
		}
		const metadata = decodeMetadata(Buffer.from(rawMetaData.data.result.value.data[0], 'base64'))
		console.log(metadata)
		const nft_metadata: any = await axios.get(metadata.data.uri)
		console.log(nft_metadata.data)

	} catch (e) {
		console.log(e)
	}
}


async function getTokensForWallet(walltAddress: PublicKey){
	const solana = new Connection(CONNECTION)
	const tokens =  await solana.getTokenAccountsByOwner(
		walltAddress, 
		{
			programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
		})
	return tokens
}

const address = new PublicKey("CuxjQhNwpuGJVhnSt4czUkToWy5nemKDeVrEURNZXqgj")
getNft(address)
getTokensForWallet(new PublicKey("DcTmx4VLcf5euAB17nynax7g55xuB3XKBDyz1pudMcjW")).then(tokens => console.log(tokens.value[0].account.data))