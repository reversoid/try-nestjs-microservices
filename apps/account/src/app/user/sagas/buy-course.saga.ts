import { PurchaseState } from '@school/interfaces';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';

export class BuyCourseSaga {
  private state: BuyCourseSagaState;

  constructor(
    private user: UserEntity,
    private courseId: string,
    private rmqService: RMQService
  ) {}

  getState() {
    return this.state;
  }

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        break;
      case PurchaseState.WatingForPayment:
        break;
      case PurchaseState.Canceled:
        break;
      case PurchaseState.Purchased:
        break;
    }
    this.state.setContext(this);

    this.user.updateCourseStatus(courseId, state);
  }
}
