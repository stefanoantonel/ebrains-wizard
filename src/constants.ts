
export const storageKeys = {
  SAVED_URL: 'urlParam',
  SELECTED_USECASE: 'selectedUsecase',
  RETURN_LOGIN: 'returnFromLogin',
  MODELS_LIST: 'modelsList',
  SELECTED_COLLAB: 'selectedCollab',
};

export const drive = {
  DRIVE_API_URL: 'https://drive.ebrains.eu/api2',
  DEFAULT_UC_FOLDER_NAME: 'CLS-INTERACTIVE-UC',
  DEFAULT_MODEL_FOLDER_NAME: 'CLS-INTERACTIVE-MODELS',
  DEFAULT_MODEL_FILE_NAME: 'models.json',
};

export const nbgitpuller = {
  BASE: 'https://lab.ebrains.eu/hub/user-redirect/git-pull?repo=https%3A%2F%2Fgithub.com%2Fantonelepfl%2Fusecases&branch=dev',
  URL_PATH_BASE: '&urlpath=lab%2Ftree%2Fusecases%2F',
};

export const pages = {
  USECASE_SELECTION: 'usecaseSelection',
  COLLAB_SELECTION: 'collabSelection',
  MODEL_SELECTION: 'modelSelection',
};

export const modelCatalog = {
  URL: 'https://validation-v2.brainsimulation.eu/models/',
  HIPPOCAMPUS_QUERY: '?brain_region=hippocampus&organization=HBP-SP6&model_scope=single%20cell&species=Rattus%20norvegicus&collab_id=12027&size=1000000',
};

export const model = {
  BREADCRUMB_PROPERTIES: ['species', 'brain_region', 'cell_type', 'name'],
};