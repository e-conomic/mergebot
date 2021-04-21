import { GitHub } from '@actions/github/lib/utils'

class ActionContextRepo {
    owner: string ='';
    repo: string = '';
}

class ActionContext {
    actor: string ='';
    eventName: string = '';
    checkSuiteConclusion: string = ''
    prIds: number[] = []
    repo: ActionContextRepo = new ActionContextRepo()
}

class ActionInput {
    gitHubUser: string = '';
    gitHubToken: string = '';
    label: string = '';
    semVerMatch: string = '';
}

class InternalContext {
    actionContext: ActionContext = new ActionContext();
    gitHubClient!: InstanceType<typeof GitHub>;
    input: ActionInput = new ActionInput();
}

export {
  InternalContext,
  ActionInput,
  ActionContext,
  ActionContextRepo
}
