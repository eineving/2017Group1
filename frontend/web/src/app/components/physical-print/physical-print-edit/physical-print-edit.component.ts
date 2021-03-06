import {Location} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Ng4FilesConfig, Ng4FilesSelected, Ng4FilesService, Ng4FilesStatus} from 'angular4-files-upload';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {isNullOrUndefined} from 'util';
import {DigitalPart} from '../../../model/digital-part';
import {DigitalPrint} from '../../../model/digital-print';
import {Material} from '../../../model/material';
import {PhysicalPart} from '../../../model/physical-part';
import {PhysicalPrint} from '../../../model/physical-print';
import {DigitalPartService} from '../../../services/digital-part/digital-part.service';
import {DigitalPrintService} from '../../../services/digital-print/digital-print.service';
import {ErrorService} from '../../../services/error.service';
import {MaterialService} from '../../../services/material/material.service';
import {PhysicalPartService} from '../../../services/physical-part/physical-part.service';
import {PhysicalPrintService} from '../../../services/physical-print/physical-print.service';
import {OrderService} from "../../../services/order/order.service";
import {OrderedPart} from "../../../model/ordered-part";

declare var $: any;

@Component({
  selector: 'app-physical-print-edit',
  providers: [PhysicalPrintService, ErrorService, DigitalPrintService, DigitalPartService, PhysicalPartService, MaterialService, OrderService],
  templateUrl: './physical-print-edit.component.html',
  styleUrls: ['./physical-print-edit.component.scss'],
})
export class PhysicalPrintEditComponent implements OnInit, OnChanges {
  orderedParts: OrderedPart [] = [];
  materials: Material[];
  digitalPrint: DigitalPrint;
  digitalPrints: DigitalPrint[];

  @Input('physicalPrint') physicalPrint: PhysicalPrint = null;
  @Input('nav') nav = true;
  @Input('creating') creating = false;
  private modalRef: BsModalRef;
  @ViewChild('modalError') modalDelete;
  @Output() changed: EventEmitter<PhysicalPrint> = new EventEmitter<PhysicalPrint>();
  private physicalPartOrderArray = [];
  private loaded = false;
  private table: any;
  private digitalParts: DigitalPart[];
  public selectedFile;
  public selectedFileName;
  public errorMessage;
  private slmConfig: Ng4FilesConfig = {
    acceptExtensions: ['slm'],
    maxFilesCount: 1,
    maxFileSize: 5120000,
    totalFilesSize: 10120000,
  };

  /* forms */
  private requiredFieldsForm: FormGroup = null;

  constructor(private modalService: BsModalService,
              private route: ActivatedRoute,
              private physicalPrintService: PhysicalPrintService,
              private digitalPrintService: DigitalPrintService,
              private formBuilder: FormBuilder,
              private errorService: ErrorService,
              private _location: Location,
              private ng4FilesService: Ng4FilesService,
              private digitalPartService: DigitalPartService,
              private physicalPartService: PhysicalPartService,
              private materialService: MaterialService,
              private orderService: OrderService) {
    this.physicalPartOrderArray = Array.apply(null, Array(100000)).map(Number.prototype.valueOf, 0); //PLEASE fix this hack
  }

  ngOnInit(): void {
    this.ng4FilesService.addConfig(this.slmConfig);
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id === 'create') { // new product is being created
        this.create();
      } else if (id) {
        this.getData(id);
      }
    });
  }

  public filesSelect(selectedFiles: Ng4FilesSelected): void {
    if (selectedFiles.status === Ng4FilesStatus.STATUS_SUCCESS) {
      this.selectedFile = selectedFiles.files[0];
      this.selectedFileName = this.selectedFile.name;
    } else if (selectedFiles.status === Ng4FilesStatus.STATUS_MAX_FILE_SIZE_EXCEED) {
      this.errorMessage = 'Max file size exceeded';
      this.openModal('#errorFormDismissBtn');
    } else if (selectedFiles.status === Ng4FilesStatus.STATUS_NOT_MATCH_EXTENSIONS) {
      this.errorMessage = 'Only ".slm" files allowed!';
      this.openModal('#errorFormDismissBtn');
    }
  }

  private dismissError() {
    this.modalRef.hide();
  }

  openModal(autoFocusIdWithHashtag: string) {
    this.modalRef = this.modalService.show(this.modalDelete);
    if (autoFocusIdWithHashtag != null && autoFocusIdWithHashtag !== '') {
      const addInput: any = ($(autoFocusIdWithHashtag) as any);
      setTimeout(() => {
        addInput.focus();
      }, 200);
    }
  }

  create() {
    /* init with a boilerplate */
    this.creating = true;
    if (this.creating) {
      this.physicalPrint = new PhysicalPrint({});
    }
    this.populate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.creating) {
      this.create();
    } else if (this.physicalPrint) {
      this.populate();
    }
  }

  /* get the product */
  getData(id) {
    this.physicalPrintService.getPhysicalPrint(id).subscribe(
      (physicalPrint) => {
        this.physicalPrint = physicalPrint;
        this.populate();
      },
    );
  }

  /* populate data */
  private populate() {
    /* get d prints */
    this.digitalPrintService.getDigitalPrints().subscribe((dPrints) => {
      this.digitalPrints = dPrints;

      this.digitalPartService.getDigitalParts().subscribe((dParts) => {
        this.digitalParts = dParts;

        this.materialService.getMaterials().subscribe((materials) => {
          this.materials = materials;

          this.orderService.getOrders().subscribe((orders) => {
            orders.forEach((order) => {
              order.orderedParts.forEach((orderedPart) => {
                this.orderedParts.push(orderedPart);
              });
            })

            this.constructForms();
          });

        });
      });

    });
  }

  /* init forms */
  private constructForms() {
    const fields = {
      digitalPrintID: [this.physicalPrint && this.physicalPrint.digitalPrintID ? this.physicalPrint.digitalPrintID : '',
        Validators.compose([Validators.required])],
      materialID: [1, Validators.compose([Validators.required])],
    };

    this.requiredFieldsForm = this.formBuilder.group(fields);
    this.requiredFieldsForm.get('digitalPrintID').valueChanges.subscribe((data) => {
      this.setDigitalPrint(data);
    });

    this.setDigitalPrint(this.requiredFieldsForm.get('digitalPrintID').value);
    this.loaded = true;
  }

  private setDigitalPrint(id: number){
    this.digitalPrint = this.digitalPrints.filter((dPrint) => {
      if (dPrint.id === parseInt(this.requiredFieldsForm.get('digitalPrintID').value)) {
        return dPrint;
      }
    })[0];
  }

  getDigitalParts(dPrint: DigitalPrint): DigitalPart [] {
    let dParts = [];
    Object.getOwnPropertyNames(dPrint.magicsPartPairing).forEach((key) => {
        dParts.push(this.digitalParts.filter((dPart) => {
          if (dPart.id === this.digitalPrint.magicsPartPairing[key]) {
            dPart["mkey"] = key;
            return dPart;
          }
        })[0]);
      });
    return dParts;
  }

  /* save product instance */
  save() {
    /* convert relevant fields */

    const id = this.physicalPrint.id;

    this.requiredFieldsForm.value.digitalPrintID = parseInt(this.requiredFieldsForm.get('digitalPrintID').value);
    this.requiredFieldsForm.value.materialID = parseInt(this.requiredFieldsForm.get('materialID').value);
    const physicalPrint: PhysicalPrint = new PhysicalPrint(this.requiredFieldsForm.value);

    this.creating ? delete physicalPrint['id'] : physicalPrint.id = id;

    if (this.creating) { // a new product
      console.log("creating: ", physicalPrint)
      this.physicalPrintService.createPhysicalPrint(physicalPrint).subscribe(
        (pPrint) => {
          Object.getOwnPropertyNames(this.digitalPrint.magicsPartPairing).forEach((key, index) => {
            let pp = PhysicalPart.createFromPhysicalPrint(pPrint);
            pp.orderedPartID = this.physicalPartOrderArray[index];
            pp.magicsPartPairingLabel = key;
            console.log("creating: ", pp)
            this.physicalPartService.createPhysicalPart(pp).subscribe((success) => {
            });
          });

          this.physicalPrintService.uploadSlmFile(pPrint, this.selectedFile).subscribe(
            (response) => {
              if (this.nav) {
                this.back();
              }
              this.changed.emit(pPrint);
            });
        }, (error) => {
          console.log(error);
          this.errorService.showAlert(error.verobose_message_header, error.verbose_message);
        },
      );
    } else {
      this.physicalPrintService.updatePhysicalPrint(physicalPrint).subscribe(
        (data) => {
            if (this.nav) {
            this.back();
          }
            this.changed.emit(data);
        }, (error) => {
          console.log(error);
          this.errorService.showAlert(error.verobose_message_header, error.verbose_message);
        },
      );
    }
  }

  cancel() {
    if (this.nav) {
      this.back();
    }
    this.changed.emit(this.physicalPrint);
  }

  back() {
    this._location.back();
  }

}
