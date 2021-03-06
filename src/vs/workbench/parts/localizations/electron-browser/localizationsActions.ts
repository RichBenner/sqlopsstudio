/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { IFileService } from 'vs/platform/files/common/files';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditor } from 'vs/workbench/common/editor';
import { join } from 'vs/base/common/paths';
import URI from 'vs/base/common/uri';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { language } from 'vs/base/common/platform';
import { IUriDisplayService } from 'vs/platform/uriDisplay/common/uriDisplay';

export class ConfigureLocaleAction extends Action {
	public static readonly ID = 'workbench.action.configureLocale';
	public static readonly LABEL = localize('configureLocale', "Configure Display Language");

	// {{SQL CARBON EDIT}}
	private static DEFAULT_CONTENT: string = [
		'{',
		`\t// ${localize('displayLanguage', 'Defines SQL Operations Studio\'s display language.')}`,
		`\t// ${localize('doc', 'See {0} for a list of supported languages.', 'https://go.microsoft.com/fwlink/?LinkId=761051')}`,
		`\t`,
		`\t// ${localize('restart', 'Changing the value requires restarting SQL Operations Studio.')}`,
		'}'
	].join('\n');

	constructor(id: string, label: string,
		@IFileService private fileService: IFileService,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@IEditorService private editorService: IEditorService,
		@IUriDisplayService private uriDisplayService: IUriDisplayService
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<IEditor> {
		const file = URI.file(join(this.environmentService.appSettingsHome, 'locale.json'));
		return this.fileService.resolveFile(file).then(null, (error) => {
			return this.fileService.createFile(file, ConfigureLocaleAction.DEFAULT_CONTENT);
		}).then((stat) => {
			if (!stat) {
				return undefined;
			}
			return this.editorService.openEditor({
				resource: stat.resource
			});
		}, (error) => {
			throw new Error(localize('fail.createSettings', "Unable to create '{0}' ({1}).", this.uriDisplayService.getLabel(file, true), error));
		});
	}
}