/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as constants from '../constants';
import * as sqlops from 'sqlops';
import ControllerBase from './controllerBase';
import * as vscode from 'vscode';
import { flatFileWizard } from '../wizard/flatFileWizard';
import { ServiceClient } from '../services/serviceClient';
import { SqlOpsDataClient } from 'dataprotocol-client';
import { managerInstance, ApiType } from '../services/serviceApiManager';
import { FlatFileProvider } from '../services/contracts';

/**
 * The main controller class that initializes the extension
 */
export default class MainController extends ControllerBase {

	/**
	 * Deactivates the extension
	 */
	public deactivate(): void {
		console.log('Main controller deactivated');
	}

	public activate(): Promise<boolean> {
		const outputChannel = vscode.window.createOutputChannel(constants.serviceName);
        new ServiceClient(outputChannel).startService(this._context);

		console.log('Starting service client for flat file import');
		managerInstance.onRegisteredApi<FlatFileProvider>(ApiType.FlatFileProvider)(provider => {
			console.log('Flat file import api registered');
			this.initializeFlatFileProvider(provider);
		});

		sqlops.tasks.registerTask('flatFileImport.start', e => flatFileWizard());

		return Promise.resolve(true);
	}

	private initializeFlatFileProvider(provider: FlatFileProvider) {
		sqlops.tasks.registerTask('flatFileImport.helloWorld', () => {
			vscode.window.showInputBox({
				prompt: 'What is your name?'
			}).then(name => {
				provider.sendHelloWorldRequest({ name: name }).then(response => {
					vscode.window.showInformationMessage('Response: ' + response.response);
				});
			});
		});
	}
}
