import { PurchaseState } from '@school/interfaces';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import {
  BuyCourseSagaStateCanceled,
  BuyCourseSagaStatePurchased,
  BuyCourseSagaStateWaitingForPayment,
  BuyCourseSagaStateStarted,
} from './buy-course.steps';

const PURCHASE_STATE_TO_NEW_MATCHING_SAGA_STATE: Record<
  PurchaseState,
  BuyCourseSagaState
> = {
  Started: (() => new BuyCourseSagaStateStarted())(),
  WaitingForPayment: (() => new BuyCourseSagaStateWaitingForPayment())(),
  Purchased: (() => new BuyCourseSagaStatePurchased())(),
  Canceled: (() => new BuyCourseSagaStateCanceled())(),
};

export class BuyCourseSaga {
  private state: BuyCourseSagaState;

  constructor(
    public user: UserEntity,
    public courseId: string,
    public rmqService: RMQService,
  ) {
    const purchaseState = user.getCourseState(courseId);
    this.setState(purchaseState, courseId)
  }

  getState() {
    return this.state;
  }

  setState(state: PurchaseState, courseId: string) {
    this.state = PURCHASE_STATE_TO_NEW_MATCHING_SAGA_STATE[state];

    this.state.setContext(this);

    this.user.setCourseStatus(courseId, state);
  }
}
