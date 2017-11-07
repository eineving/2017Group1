package se.chalmers.dat265.group1.api;

import se.chalmers.dat265.group1.model.*;
import se.chalmers.dat265.group1.storage.DBInterface;
import se.chalmers.dat265.group1.storage.PostgresSQLConnector;
import se.chalmers.dat265.group1.storage.repository.GenericRepository;

public class ApiController {

    protected DBInterface dbConnector;
    protected GenericRepository<Customer> customerRepository;
    protected GenericRepository<Order> orderRepository;
    protected GenericRepository<OrderedPart> orderedPartRepository;
    protected GenericRepository<DigitalPart> digitalPartRepository;
    protected GenericRepository<PhysicalPart> physicalPartRepository;
    protected GenericRepository<PhysicalPrint> physicalPrintRepository;

    public ApiController(boolean debug) {
        this.dbConnector = new PostgresSQLConnector(debug);
        customerRepository = new GenericRepository<>(Customer.class, dbConnector);
        orderRepository = new GenericRepository<>(Order.class, dbConnector);
        orderedPartRepository = new GenericRepository<>(OrderedPart.class, dbConnector);
        digitalPartRepository = new GenericRepository<>(DigitalPart.class, dbConnector);
        physicalPartRepository = new GenericRepository<>(PhysicalPart.class, dbConnector);
        physicalPrintRepository = new GenericRepository<>(PhysicalPrint.class, dbConnector);
    }

    protected void checkIDs(String id, DataModel object) {
        if (!id.equalsIgnoreCase(object.getId() + "")) {
            throw new IllegalArgumentException("IDs are not the same");
        }
    }
}