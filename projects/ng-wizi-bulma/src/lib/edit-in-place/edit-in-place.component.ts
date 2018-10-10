import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'nwb-edit-in-place',
  templateUrl: './edit-in-place.component.html',
  styleUrls: ['./edit-in-place.component.scss'],
  host: {
    class: 'nwb-edit-in-place'
  },
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NwbEditInPlaceComponent,
      multi: true
    }
  ]
})
export class NwbEditInPlaceComponent implements ControlValueAccessor, OnInit {
  @ViewChild('editInPlace')
  editInPlace: ElementRef;

  @ViewChild('invisibleText')
  invisibleText: ElementRef;

  @Input()
  config: NwbEditInPlaceConfig = {};

  public currentValue = '';
  private preValue = '';

  public inputWidth: number;
  public editing = false;
  public isLoading;

  private onChange: Function = Function.prototype;
  private onTouched: Function = Function.prototype;

  ngOnInit() {
    this.resizeInput();
  }

  get value(): string {
    return this.currentValue;
  }

  set value(v: string) {
    if (v !== this.currentValue) {
      this.currentValue = v;
    }
  }

  writeValue(value: string) {
    this.currentValue = value;
  }

  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  private _setValue(v: string) {
    this.writeValue(v);
    this.value = v;
    this.onChange(v);
    this.resizeInput();
  }

  edit() {
    this.preValue = this.currentValue;
    this.editing = true;
  }

  onSubmit() {
    this.editing = false;
    if (this.currentValue !== this.preValue) {
      if (typeof this.config.handler === 'function') {
        this.isLoading = true;
        this.config.handler(this.currentValue, this.config.data).subscribe(
          hasChanged => {
            this.isLoading = false;
            if (hasChanged) {
              this._setValue(this.currentValue);
            } else {
              this._setValue(this.preValue);
            }
          },
          () => {
            this.isLoading = false;
            this._setValue(this.preValue);
          }
        );
      } else {
        this._setValue(this.currentValue);
      }
    }
  }

  resizeInput() {
    setTimeout(() => {
      const minWidth = 32;
      if (this.invisibleText.nativeElement.offsetWidth > minWidth) {
        this.inputWidth = this.invisibleText.nativeElement.offsetWidth + 2;
      } else {
        this.inputWidth = minWidth;
      }
    }, 0);
  }
}

export interface NwbEditInPlaceConfig {
  /** TODO Set Options to populate a Dropdown **/
  // _options?: QueryList<NwbOptionComponent>;

  /** Data to pass as the second argument for the handler method if any **/
  data?: any;

  /**
   * handler method to call on change.
   * This allows you to perform any action before setting new value to the model
   * It has to return a boolean observable. If the returned value is true then the model will change.
   */
  handler?: (value: any, data: any) => Observable<boolean>;
}
